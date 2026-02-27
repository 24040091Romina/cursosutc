// main.js - Versión profesional y corta
document.addEventListener('DOMContentLoaded', () => {
    cargarCursos();
    configurarLogin();
    configurarRegistroInactivo();
});

// Registro inactivo
function configurarRegistroInactivo() {
    document.getElementById('btnRegistroInactivo')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarAlerta('Registro deshabilitado', '⚠️ Registro no disponible.<br>Solo iniciar sesión.', 'warning');
    });
}

// Login
function configurarLogin() {
    const form = document.getElementById('loginForm');
    const btn = document.getElementById('btnLogin');
    const msg = document.getElementById('mensajeLogin');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const pass = document.getElementById('password').value;
        
        if (!email || !pass) {
            mostrarMensaje(msg, 'Campos obligatorios', 'danger');
            return;
        }
        
        btn.disabled = true;
        btn.innerHTML = '<span>Verificando...</span> <i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error);
            
            mostrarMensaje(msg, '✅ Login exitoso', 'success');
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
                window.location.href = '/dashboard.html';
            }, 1000);
            
        } catch (error) {
            mostrarMensaje(msg, error.message, 'danger');
            btn.disabled = false;
            btn.innerHTML = '<span>Ingresar</span> <i class="fas fa-arrow-right"></i>';
        }
    });
}

// Mensaje en modal
function mostrarMensaje(el, txt, tipo) {
    if (!el) return;
    el.textContent = txt;
    el.className = `alert alert-${tipo}`;
    el.classList.remove('d-none');
}

// Cargar cursos (diseño profesional)
async function cargarCursos() {
    try {
        const res = await fetch('/api/cursos');
        const cursos = await res.json();
        const container = document.getElementById('cursos-container');
        
        if (!container) return;
        if (!cursos.length) {
            container.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">Próximamente más cursos</div></div>';
            return;
        }
        
        container.innerHTML = cursos.map(curso => {
            const badgeClass = curso.nivel === 'basico' ? 'badge-basico' : 
                             curso.nivel === 'intermedio' ? 'badge-intermedio' : 'badge-avanzado';
            const iniciales = curso.instructor.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            const fecha = new Date(curso.fecha_inicio).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            
            return `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="course-card">
                        <span class="course-badge ${badgeClass}">${curso.nivel}</span>
                        <div class="course-image"><i class="fas fa-laptop-code"></i></div>
                        <div class="course-content">
                            <h3 class="course-title">${curso.nombre_cursos}</h3>
                            <div class="course-meta"><i class="fas fa-clock"></i><span><strong>Duración:</strong> ${curso.horas}h</span></div>
                            <div class="course-meta"><i class="fas fa-calendar-alt"></i><span><strong>Inicio:</strong> ${fecha}</span></div>
                            <div class="course-instructor">
                                <div class="instructor-avatar">${iniciales}</div>
                                <div class="instructor-info">
                                    <div class="instructor-name">${curso.instructor}</div>
                                    <div class="instructor-label">Instructor</div>
                                </div>
                            </div>
                            <div class="course-footer">
                                <div class="course-price">$${parseFloat(curso.costo).toFixed(2)} <small>USD</small></div>
                                <button class="btn-enroll" onclick="mostrarAlerta('Acceso restringido', 'Debes iniciar sesión', 'info')">
                                    <span>Inscribirme</span> <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Alertas bonitas
function mostrarAlerta(titulo, mensaje, tipo = 'info', tiempo = 4000) {
    const iconos = { info: 'fa-info-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle', danger: 'fa-times-circle' };
    const alerta = document.createElement('div');
    alerta.className = `alerta-personalizada alerta-${tipo}`;
    alerta.innerHTML = `
        <div class="alerta-header"><i class="fas ${iconos[tipo]}"></i><span>${titulo}</span></div>
        <div class="alerta-body">${mensaje}</div>
        <div class="alerta-footer"><button class="btn-alerta" onclick="this.closest('.alerta-personalizada').remove()">Entendido</button></div>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta?.remove(), tiempo);
}