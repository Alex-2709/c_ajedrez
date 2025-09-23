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

    const voucherBase64 = await fileToBase64(voucherFile);
    const dniBase64 = await fileToBase64(dniFile);

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
        "Voucher (URL)": voucherBase64,
        "DNI Foto (URL)": dniBase64
    };

    console.log("Datos enviados a SheetBest:", data); // ✅ Para depurar

    try {
        const response = await fetch('https://api.sheetbest.com/sheets/82607141-bae6-46cf-adb1-44dcbfc122dd', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("✅ ¡Inscripción enviada! Revisaremos tu voucher y te confirmaremos por WhatsApp en 24 horas.");

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
        alert("❌ Hubo un error. Por favor, intenta nuevamente.");
        console.error(error);
    }
});

// ==== Convertir archivo a base64 ====
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}