/**
 * perfil.js
 * ---------
 * Objetivo:
 * - Consultar y mostrar el perfil del triatleta autenticado.
 * - Permitir modificar datos puntuales del perfil mediante endpoints PATCH.
 *
 * Flujo:
 * 1) Se toma el usuario guardado en localStorage como sessionUser.
 * 2) Se consulta el triatleta por identificacion:
 *      GET http://localhost:9091/api/triatletas/identificacion/{identificacion}
 * 3) Se renderizan los datos personales, foto, modalidad, especialidad y carrera asociada.
 * 4) El usuario selecciona el campo que desea modificar.
 * 5) Se envia el cambio al endpoint correspondiente:
 *      PATCH http://localhost:9091/api/triatletas/{id}/{campo}
 * 6) Se recarga el perfil para mantener la pantalla y la sesion sincronizadas.
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // 1) CONFIG
    // =========================
    const API_BASE_URL = "http://localhost:9091";

    const ENDPOINT_IDENTIFICACION = (identificacion) =>
        `${API_BASE_URL}/api/triatletas/identificacion/${encodeURIComponent(identificacion)}`;

    const ENDPOINT_PATCH = {
        nombre: (id) => `${API_BASE_URL}/api/triatletas/${id}/nombre`,
        identificacion: (id) => `${API_BASE_URL}/api/triatletas/${id}/identificacion`,
        categoriaEdad: (id) => `${API_BASE_URL}/api/triatletas/${id}/categoria-edad`,
        genero: (id) => `${API_BASE_URL}/api/triatletas/${id}/genero`,
    };

    const BODY_KEY = {
        nombre: "nombre",
        identificacion: "identificacion",
        categoriaEdad: "categoriaEdad",
        genero: "genero",
    };

    const CATEGORIAS = [
        "Pre-benjamin",
        "Benjamin",
        "Alevin",
        "Infantil",
        "Cadetes",
        "Juvenil",
        "Junior",
        "Sub-23",
        "Absoluta",
        "Veterano 1",
        "Veterano 2",
        "Veterano 3",
    ];

    const GENEROS = ["Femenino", "Masculino", "Otro", "Prefiero no decirlo"];

    // =========================
    // 2) DOM
    // =========================
    const btnLogout = document.getElementById("btn-logout");
    const btnRecargar = document.getElementById("btn-recargar");
    const userNombreEl = document.getElementById("user-nombre");
    const mensajeCarga = document.getElementById("mensaje-carga");

    const estadoPerfil = document.getElementById("estado-perfil");
    const perfilCard = document.getElementById("perfil-card");
    const perfilFoto = document.getElementById("perfil-foto");
    const perfilNombre = document.getElementById("perfil-nombre");
    const perfilCorreo = document.getElementById("perfil-correo");
    const carreraWrap = document.getElementById("carrera-wrap");

    const formModificar = document.getElementById("form-modificar");
    const selectCampo = document.getElementById("campo-modificar");
    const valorWrap = document.getElementById("valor-wrap");
    const btnGuardar = document.getElementById("btn-guardar");
    const mensajeModificar = document.getElementById("mensaje-modificar");

    // =========================
    // 3) STATE
    // =========================
    let triatletaActual = null;

    // =========================
    // 4) HELPERS
    // =========================
    function getSessionUser() {
        try {
            const raw = localStorage.getItem("sessionUser");
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function setSessionUser(triatleta) {
        localStorage.setItem("sessionUser", JSON.stringify({
            id: triatleta.id,
            nombre: triatleta.nombre,
            identificacion: triatleta.identificacion,
            correo: triatleta.correo,
        }));
    }

    function setMensaje(el, texto, tipo = "info") {
        if (!el) return;
        el.textContent = texto;

        if (tipo === "error") el.style.color = "#8b1d1d";
        else if (tipo === "ok") el.style.color = "#0A3323";
        else el.style.color = "";
    }

    function safeText(value) {
        if (value === null || value === undefined || value === "") return "-";
        return String(value);
    }

    function boolToSiNo(value) {
        if (value === true) return "Si";
        if (value === false) return "No";
        return "-";
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = safeText(value);
    }

    function fallbackFoto() {
        return (
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
          <rect width="100%" height="100%" fill="#F7F4D5"/>
          <circle cx="80" cy="62" r="28" fill="#105666"/>
          <path d="M35 142c8-35 82-35 90 0" fill="#105666"/>
          <text x="50%" y="154" text-anchor="middle" font-size="18" fill="#0A3323">MT</text>
        </svg>`
            )
        );
    }

    // =========================
    // 5) FETCH
    // =========================
    async function fetchTriatletaPorIdentificacion(identificacion) {
        const resp = await fetch(ENDPOINT_IDENTIFICACION(identificacion), { method: "GET" });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(txt || `Error HTTP ${resp.status}`);
        }

        return await resp.json();
    }

    async function patchCampo(id, campo, valor) {
        const resp = await fetch(ENDPOINT_PATCH[campo](id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [BODY_KEY[campo]]: valor }),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(txt || `Error HTTP ${resp.status}`);
        }

        return await resp.text();
    }

    // =========================
    // 6) RENDER: perfil
    // =========================
    function renderPerfil(triatleta) {
        triatletaActual = triatleta;

        if (perfilCard) perfilCard.hidden = false;
        if (estadoPerfil) estadoPerfil.textContent = "Perfil cargado correctamente.";
        if (userNombreEl) userNombreEl.textContent = triatleta.nombre?.trim() || "Atleta";

        if (perfilNombre) perfilNombre.textContent = safeText(triatleta.nombre);
        if (perfilCorreo) perfilCorreo.textContent = safeText(triatleta.correo);

        if (perfilFoto) {
            perfilFoto.src = triatleta.urlFoto || fallbackFoto();
            perfilFoto.onerror = () => {
                perfilFoto.src = fallbackFoto();
            };
        }

        setText("dato-id", triatleta.id);
        setText("dato-identificacion", triatleta.identificacion);
        setText("dato-fecha", triatleta.fechaNacimiento);
        setText("dato-genero", triatleta.genero);
        setText("dato-activo", boolToSiNo(triatleta.activo));
        setText("dato-categoria", triatleta.categoriaEdad);
        setText("dato-cross", boolToSiNo(triatleta.modalidadCross));
        setText("dato-especialidad", triatleta.especialidad);
        setText("dato-carrera-id", triatleta.carreraId);
        setText("dato-url-foto", triatleta.urlFoto);

        if (triatleta.carrera && carreraWrap) {
            carreraWrap.hidden = false;
            setText("dato-carrera-nombre", triatleta.carrera.nombreCarrera);
            setText("dato-carrera-ubicacion", triatleta.carrera.ubicacion);
            setText("dato-carrera-fecha", triatleta.carrera.fechaEjecucion);
            setText("dato-carrera-dificultad", triatleta.carrera.nivelDificultad);
        } else if (carreraWrap) {
            carreraWrap.hidden = true;
        }

        // Mantener localStorage actualizado si cambia nombre, correo o identificacion.
        setSessionUser(triatleta);
        habilitarModificacion(true);
    }

    // =========================
    // 7) RENDER: formulario de modificacion
    // =========================
    function habilitarModificacion(activo) {
        if (selectCampo) selectCampo.disabled = !activo;
        if (btnGuardar) btnGuardar.disabled = !activo;
        renderInputValor();
    }

    function renderInputValor() {
        if (!valorWrap) return;

        const campo = selectCampo?.value ?? "";
        const valorActual = triatletaActual ? triatletaActual[campo] : "";

        let control;

        if (campo === "categoriaEdad") {
            control = document.createElement("select");
            control.innerHTML = `<option value="">Selecciona...</option>`;

            CATEGORIAS.forEach((cat) => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                if (cat === valorActual) option.selected = true;
                control.appendChild(option);
            });
        } else if (campo === "genero") {
            control = document.createElement("select");
            control.innerHTML = `<option value="">Selecciona...</option>`;

            GENEROS.forEach((genero) => {
                const option = document.createElement("option");
                option.value = genero;
                option.textContent = genero;
                if (genero === valorActual) option.selected = true;
                control.appendChild(option);
            });
        } else {
            control = document.createElement("input");
            control.type = "text";
            control.value = valorActual ?? "";
        }

        control.id = "nuevo-valor";
        control.className = "input";
        control.required = true;
        control.disabled = !campo || !triatletaActual?.id;

        valorWrap.innerHTML = "";

        const label = document.createElement("label");
        label.setAttribute("for", "nuevo-valor");
        label.textContent = "Nuevo valor";

        valorWrap.appendChild(label);
        valorWrap.appendChild(control);
    }

    // =========================
    // 8) LOAD: perfil
    // =========================
    async function cargarPerfil() {
        const sessionUser = getSessionUser();

        setMensaje(mensajeCarga, "");
        setMensaje(mensajeModificar, "");

        if (!sessionUser?.identificacion) {
            if (perfilCard) perfilCard.hidden = true;
            if (estadoPerfil) estadoPerfil.textContent = "No hay una sesion valida para cargar el perfil.";
            setMensaje(mensajeCarga, "Inicia sesion para consultar tu perfil.", "error");
            habilitarModificacion(false);
            return;
        }

        if (userNombreEl) userNombreEl.textContent = sessionUser.nombre?.trim() || "Atleta";
        if (estadoPerfil) estadoPerfil.textContent = "Consultando perfil...";

        try {
            const triatleta = await fetchTriatletaPorIdentificacion(sessionUser.identificacion);
            renderPerfil(triatleta);
            setMensaje(mensajeCarga, "Perfil cargado correctamente.", "ok");
        } catch (err) {
            console.error(err);
            if (perfilCard) perfilCard.hidden = true;
            if (estadoPerfil) estadoPerfil.textContent = "No fue posible cargar el perfil.";
            setMensaje(mensajeCarga, `No fue posible consultar. ${err.message || ""}`.trim(), "error");
            habilitarModificacion(false);
        }
    }

    // =========================
    // 9) EVENTOS
    // =========================
    btnLogout?.addEventListener("click", () => {
        localStorage.removeItem("sessionUser");
        window.location.href = "index.html";
    });

    btnRecargar?.addEventListener("click", cargarPerfil);

    selectCampo?.addEventListener("change", () => {
        setMensaje(mensajeModificar, "");
        renderInputValor();
    });

    formModificar?.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMensaje(mensajeModificar, "");

        if (!triatletaActual?.id) {
            setMensaje(mensajeModificar, "Primero debe cargar el perfil.", "error");
            return;
        }

        const campo = selectCampo?.value ?? "";
        const inputValor = document.getElementById("nuevo-valor");
        const valor = (inputValor?.value ?? "").trim();

        if (!campo || !valor) {
            setMensaje(mensajeModificar, "Selecciona una caracteristica y escribe el nuevo valor.", "error");
            return;
        }

        if (btnGuardar) btnGuardar.disabled = true;

        try {
            await patchCampo(triatletaActual.id, campo, valor);

            // Si cambia identificacion, recargamos usando el nuevo valor.
            const identificacionParaRecargar =
                campo === "identificacion" ? valor : triatletaActual.identificacion;

            const actualizado = await fetchTriatletaPorIdentificacion(identificacionParaRecargar);
            renderPerfil(actualizado);

            setMensaje(mensajeModificar, "Caracteristica actualizada correctamente.", "ok");
        } catch (err) {
            console.error(err);
            setMensaje(mensajeModificar, `No fue posible actualizar. ${err.message || ""}`.trim(), "error");
        } finally {
            if (btnGuardar && triatletaActual?.id) btnGuardar.disabled = false;
        }
    });

    // =========================
    // 10) INIT
    // =========================
    cargarPerfil();
});
