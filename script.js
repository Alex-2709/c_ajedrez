// ==== Contador regresivo ====
const countDownDate = new Date("Oct 18, 2025 09:00:00").getTime(); // ¡AJUSTA ESTA FECHA!

const x = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
    document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(x);
        document.getElementById("countdown").innerHTML = "<strong>¡EL EVENTO HA COMENZADO!</strong>";
    }
}, 1000);

// ==== Mostrar formulario solo si confirma pago ====
document.getElementById("confirmPaymentBtn").addEventListener("click", function() {
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("registrationForm").style.display = "block";
});

// ==== Envío del formulario ====
document.getElementById("registrationForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const voucherFile = formData.get('voucher');
    const dniFile = formData.get('dniImage');

    if (!voucherFile || !dniFile) {
        alert("❌ Debes subir ambas imágenes antes de enviar.");
        return;
    }

    document.getElementById("loaderOverlay").style.display = "flex";

     // === Validar si el DNI ya existe ===
    const dniIngresado = formData.get('dni');
    try {
        const consulta = await fetch('https://api.sheetbest.com/sheets/cb639a0a-9ad7-45e6-ba92-c496a4a9ede3/search?DNI=' + encodeURIComponent(dniIngresado));
        const registros = await consulta.json();
        if (registros.length > 0) {
            document.getElementById("loaderOverlay").style.display = "none";
            document.getElementById("step2").innerHTML = `
                <h2>❗ Ya existe una inscripción con este DNI</h2>
                <p>Hemos detectado que este número de DNI ya fue registrado previamente.</p>
                <p>Si crees que es un error, comunícate por WhatsApp al <strong>941 770 333</strong>.</p>
                <p>♟️ ¡Gracias por tu interés en el torneo!</p>
            `;
            return;
        }
    } catch (error) {
        document.getElementById("loaderOverlay").style.display = "none";
        document.getElementById("step2").innerHTML = `
            <h2>❌ Error al validar DNI</h2>
            <p>No pudimos verificar si tu DNI ya está registrado. Intenta nuevamente o comunícate por WhatsApp al <strong>941 770 333</strong>.</p>
        `;
        return;
    }


    const voucherUrl = await uploadToImageBB(voucherFile);
    const dniUrl = await uploadToImageBB(dniFile);

    const data = {
        "Fecha y Hora": new Date().toLocaleString(),
        "Nombres y Apellidos": formData.get('fullName'),
        "Fecha de Nacimiento": formData.get('birthDate'),
        "Edad": formData.get('age'),
        "DNI": formData.get('dni'),
        "Distrito": formData.get('district'),
        "Categoría": formData.get('category'),
        "Teléfono": formData.get('phone'),
        "Apoderado": formData.get('guardianName'),
        "Voucher (URL)": voucherUrl,
        "DNI Foto (URL)": dniUrl
    };

    console.log("Datos enviados a SheetBest:", data); // ✅ Para depurar


    try {

       
       


        const response = await fetch('https://api.sheetbest.com/sheets/cb639a0a-9ad7-45e6-ba92-c496a4a9ede3', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById("loaderOverlay").style.display = "none";

            this.reset();
            
            document.getElementById("step2").innerHTML = `
                <h2>¡Gracias por inscribirte! 🎉</h2>
                <p>Revisaremos tu comprobante de pago y DNI, y te enviaremos confirmación en menos de 24 horas.</p>
                <p>¡Prepara tus mejores jugadas! ♟️</p>
            `;
        } else {
            const errorText = await response.text();
            console.error("Respuesta de SheetBest:", errorText);
            throw new Error("Error al guardar en Sheets.");
        }
    } catch (error) {
        document.getElementById("loaderOverlay").style.display = "none";

        document.getElementById("step2").innerHTML = `
            <h2>❌ Error al enviar</h2>
            <p>Ocurrió un problema al registrar tu inscripción. Por favor, verifica tu conexión o intenta más tarde.</p>
            <p>Si el problema persiste, puedes comunicarte por WhatsApp al <strong>941 770 333</strong>.</p>
            <p>♟️ ¡No te rindas, cada jugada cuenta!</p>
        `;

        console.error(error);
    }
});

// ==== Convertir archivo con ImageBB ====
async function uploadToImageBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.imgbb.com/1/upload?key=ee779967dce870c0aff586ed0a98fbe1", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url; // URL directo de la imagen
    } else {
        throw new Error("Error al subir imagen a ImageBB");
    }
}
