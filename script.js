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

// ==== Validar y enviar formulario ====
document.getElementById("registrationForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    // Convertir imágenes a base64
    const voucherFile = formData.get('voucher');
    const dniFile = formData.get('dniImage');

    const voucherBase64 = await fileToBase64(voucherFile);
    const dniBase64 = await fileToBase64(dniFile);

    const data = {
        fullName: formData.get('fullName'),
        birthDate: formData.get('birthDate'),
        age: formData.get('age'),
        dni: formData.get('dni'),
        district: formData.get('district'),
        category: formData.get('category'),
        phone: formData.get('phone'),
        guardianName: formData.get('guardianName'),
        voucher: voucherBase64,
        dniImage: dniBase64
    };

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwZlxYObb_t9lut9QaO1-hsEmsFiIhtdM0bjgDCT1z-oPDwhlXtOuQhuDFhoXTRmorhQQ/exec', { // <-- ¡PEGA AQUÍ TU URL DE DESPLIEGUE!
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.result === "success") {
            alert("✅ ¡Inscripción enviada! Revisaremos tu voucher y te confirmaremos por WhatsApp en 24 horas.");

            // Limpiar y mostrar mensaje de éxito
            this.reset();
            document.getElementById("step2").innerHTML = `
                <h2>¡Gracias por inscribirte! 🎉</h2>
                <p>Revisaremos tu comprobante de pago y DNI, y te enviaremos confirmación en menos de 24 horas.</p>
                <p>Puedes ver tu inscripción registrada en nuestra base de datos. ¡Prepara tus mejores jugadas! ♟️</p>
            `;
        } else {
            throw new Error("Error al guardar los datos.");
        }
    } catch (error) {
        alert("❌ Hubo un error al enviar tu inscripción. Por favor, intenta nuevamente o contacta al organizador.");
        console.error(error);
    }
});

// Función auxiliar para convertir archivo a base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}