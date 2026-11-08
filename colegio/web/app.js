"use strict";

const state = {
    courses: [],
    students: [],
    teachers: [],
    grades: [],
    users: [{ username: "admin", role: "admin", identification: null }],
    currentUser: null,
    activePage: "overview"
};

const STORAGE_KEY = "aula-school-data-v1";
const DRAFT_KEY = "aula-school-draft-v1";
const DEMO_SEED_KEY = "aula-school-demo-seeded-v1";
const PASSWORD_ITERATIONS = 120000;
let storageNotice = "";
const AREAS = [
    { id: "matematicas", name: "Matemáticas" },
    { id: "lengua", name: "Lengua y Literatura" },
    { id: "ciencias-naturales", name: "Ciencias Naturales" },
    { id: "ciencias-sociales", name: "Ciencias Sociales" },
    { id: "ingles", name: "Inglés" },
    { id: "educacion-fisica", name: "Educación Física" }
];

const pageInfo = {
    overview: ["PANEL", "Resumen"],
    students: ["GESTIÓN ACADÉMICA", "Estudiantes"],
    teachers: ["GESTIÓN ACADÉMICA", "Profesores"],
    courses: ["GESTIÓN ACADÉMICA", "Cursos"],
    users: ["ACCESOS", "Usuarios"],
    myCourses: ["MI ESPACIO", "Mis cursos"],
    studentGrades: ["MI ESPACIO", "Mi curso y notas"],
    myStudents: ["MI ESPACIO", "Mis estudiantes"]
};

const navByRole = {
    admin: [
        ["overview", "▦", "Resumen"],
        ["students", "♙", "Estudiantes"],
        ["teachers", "♧", "Profesores"],
        ["courses", "▤", "Cursos"],
        ["users", "⚿", "Usuarios"]
    ],
    teacher: [
        ["myCourses", "▤", "Mis cursos"],
        ["myStudents", "♙", "Estudiantes y notas"]
    ],
    student: [
        ["studentGrades", "▤", "Mi curso y notas"]
    ]
};

const $ = (selector) => document.querySelector(selector);
const loginScreen = $("#login-screen");
const appScreen = $("#app-screen");
const pageContent = $("#page-content");
const dialog = $("#app-dialog");
const dialogForm = $("#dialog-form");
const toastElement = $("#toast");
let toastTimer;
let storedDataWasInvalid = false;

const storageReady = initializeStorage();

$("#current-date").textContent = new Intl.DateTimeFormat("es", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
}).format(new Date());

$("#toggle-login-password").addEventListener("click", () => {
    const password = $("#login-password");
    const showing = password.type === "text";
    password.type = showing ? "password" : "text";
    $("#toggle-login-password").textContent = showing ? "Mostrar" : "Ocultar";
    $("#toggle-login-password").setAttribute(
        "aria-label", showing ? "Mostrar contraseña" : "Ocultar contraseña");
    $("#toggle-login-password").setAttribute("aria-pressed", String(!showing));
});

$("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginForm = event.currentTarget;
    await storageReady;
    const form = new FormData(loginForm);
    const username = String(form.get("username")).trim().toLowerCase();
    const password = String(form.get("password"));
    const user = state.users.find((item) => item.username.toLowerCase() === username);
    let passwordMatches = false;
    try {
        passwordMatches = Boolean(user && username === "admin" && password === "admin")
            || Boolean(user && await verifyPassword(password, user));
    } catch (error) {
        $("#login-error").textContent = "No se pudo validar la contraseña en este navegador.";
        return;
    }

    if (!passwordMatches) {
        $("#login-error").textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    state.currentUser = user;
    state.activePage = user.role === "admin"
        ? "overview"
        : user.role === "student" ? "studentGrades" : "myCourses";
    $("#login-error").textContent = "";
    loginForm.reset();
    showApplication();
});

$("#logout-button").addEventListener("click", () => {
    state.currentUser = null;
    appScreen.hidden = true;
    loginScreen.hidden = false;
});

$("#main-nav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    state.activePage = button.dataset.page;
    render();
});

$("#page-content").addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const { action: name, id } = action.dataset;
    if (name === "add-student") openStudentDialog();
    if (name === "add-teacher") openTeacherDialog();
    if (name === "add-course") openCourseDialog();
    if (name === "add-user") openUserDialog();
    if (name === "edit-student") openPersonEditDialog("students", id);
    if (name === "edit-teacher") openPersonEditDialog("teachers", id);
    if (name === "edit-course") openCourseEditDialog(id);
    if (name === "delete-student") deleteRecord("students", id);
    if (name === "delete-teacher") deleteRecord("teachers", id);
    if (name === "delete-course") deleteCourse(id);
    if (name === "delete-user") deleteUser(id);
    if (name === "assign-student-course") openStudentCourseDialog(id);
    if (name === "assign-teacher-course") openTeacherCourseDialog(id);
    if (name === "save-student-grades") saveTeacherGrades(id);
});

$("#page-content").addEventListener("input", (event) => {
    if (event.target.matches("[data-search]")) {
        const query = event.target.value.trim().toLocaleLowerCase("es");
        const table = event.target.closest(".panel").querySelector("tbody");
        table.querySelectorAll("tr[data-searchable]").forEach((row) => {
            row.hidden = !row.dataset.searchable.includes(query);
        });
    }
});

dialogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    $("#dialog-error").textContent = "";
    const handler = dialogForm.dataset.handler;
    if (handler && typeof dialogHandlers[handler] === "function") {
        dialogHandlers[handler](new FormData(dialogForm));
    }
});

dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-dialog-close]")) {
        dialog.close();
    }
});

dialog.addEventListener("close", clearFormDraft);

dialogForm.addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) return;
    sanitizeFilteredInput(field);
});
dialogForm.addEventListener("input", persistFormDraft);
dialogForm.addEventListener("change", persistFormDraft);

function sanitizeFilteredInput(field) {
    if (field.dataset.filter === "digits") {
        field.value = field.value.replace(/\D/g, "");
    } else if (field.dataset.filter === "letters") {
        field.value = field.value.replace(/[^\p{L}\s'-]/gu, "");
    }
}

function persistFormDraft() {
    const fields = Array.from(dialogForm.elements)
        .filter((field) => field.name && field.type !== "password")
        .map((field) => [field.name, field.value,
            field.type === "checkbox" ? field.checked : undefined]);
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            handler: dialogForm.dataset.handler,
            fields
        }));
    } catch (error) {
        console.error("Error guardando el borrador del formulario:", error);
        showToast("No se pudo guardar el borrador en este navegador.");
    }
}

function restoreFormDraft(handler) {
    try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (!draft || draft.handler !== handler || !Array.isArray(draft.fields)) return;
        draft.fields.forEach(([name, value, checked]) => {
            const field = Array.from(dialogForm.elements).find((item) => item.name === name
                && (item.type !== "checkbox" || item.value === value));
            if (field && field.type !== "password") {
                if (field.type === "checkbox") field.checked = Boolean(checked);
                else {
                    field.value = value;
                    if (field instanceof HTMLInputElement) sanitizeFilteredInput(field);
                }
            }
        });
    } catch (error) {
        console.error("Error recuperando el borrador del formulario:", error);
        showToast("No se pudo recuperar el borrador del formulario.");
    }
}

function clearFormDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
        console.error("Error limpiando el borrador del formulario:", error);
        showToast("No se pudo limpiar el borrador del formulario.");
    }
}

async function initializeStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.version !== 1 || !Array.isArray(data.courses)
                    || !Array.isArray(data.students) || !Array.isArray(data.teachers)
                    || !Array.isArray(data.users)
                    || !data.users.every((user) => user && typeof user.username === "string"
                        && ["admin", "teacher", "student"].includes(user.role))) {
                throw new Error("Los datos guardados no tienen el formato esperado.");
            }
            state.courses = data.courses;
            state.students = data.students;
            state.teachers = data.teachers;
            state.grades = Array.isArray(data.grades) ? data.grades : [];
            state.users = data.users;
        }
    } catch (error) {
        storedDataWasInvalid = true;
        storageNotice = "No se pudieron leer los datos guardados. Se iniciará sin restaurarlos.";
        console.error("Error leyendo datos guardados de Aula:", error);
    }

    if (!state.users.some((user) => user.username.toLowerCase() === "admin")) {
        state.users.unshift({ username: "admin", role: "admin", identification: null });
    }

    await seedDemoData();
    if (!storedDataWasInvalid) persistState();
    if (storageNotice) showToast(storageNotice);
}

async function seedDemoData() {
    if (storedDataWasInvalid) return;
    try {
        if (state.users.some((user) => user.isDemo)) {
            localStorage.setItem(DEMO_SEED_KEY, "true");
            renderDemoCredentials();
            return;
        }
        if (localStorage.getItem(DEMO_SEED_KEY) === "true") {
            renderDemoCredentials();
            return;
        }

        const teacherCredential = await createPasswordCredential("profe123");
        const studentCredential = await createPasswordCredential("alumno123");
        const courseCode = uniqueCourseCode("9001");
        const course = { id: makeId(), code: courseCode, name: "10° A · Curso demo" };
        const teacherIdentification = uniqueIdentification("990002");
        const studentIdentification = uniqueIdentification("990001");
        const teacherUsername = uniqueUsername("profe.demo");
        const studentUsername = uniqueUsername("alumno.demo");
        const teacher = {
            identification: teacherIdentification,
            firstName: "Carlos",
            lastName: "Rivera",
            age: 35,
            courseId: course.id,
            areaIds: ["matematicas", "lengua", "ingles"]
        };
        const student = {
            identification: studentIdentification,
            firstName: "Valeria",
            lastName: "Mora",
            age: 17,
            courseIds: [course.id]
        };

        state.courses.push(course);
        state.teachers.push(teacher);
        state.students.push(student);
        state.users.push(
            { username: teacherUsername, role: "teacher", identification: teacherIdentification, isDemo: true, ...teacherCredential },
            { username: studentUsername, role: "student", identification: studentIdentification, isDemo: true, ...studentCredential }
        );
        state.grades.push(
            demoGrade(student, course, "matematicas", 4.5),
            demoGrade(student, course, "lengua", 4.2),
            demoGrade(student, course, "ingles", 4.8)
        );

        if (persistState()) {
            localStorage.setItem(DEMO_SEED_KEY, "true");
            renderDemoCredentials();
        }
    } catch (error) {
        console.error("No se pudieron crear los datos de demostración:", error);
        showToast("No se pudieron crear los datos demo en este navegador.");
    }
}

function demoGrade(student, course, areaId, value) {
    return {
        studentIdentification: student.identification,
        courseId: course.id,
        areaId,
        value,
        updatedAt: new Date().toISOString()
    };
}

function uniqueCourseCode(start) {
    let code = Number(start);
    while (state.courses.some((course) => course.code === String(code))) code++;
    return String(code);
}

function uniqueIdentification(start) {
    let identification = Number(start);
    while (state.students.some((person) => person.identification === String(identification))
            || state.teachers.some((person) => person.identification === String(identification))) {
        identification++;
    }
    return String(identification);
}

function uniqueUsername(base) {
    let username = base;
    let suffix = 2;
    while (state.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        username = `${base}${suffix++}`;
    }
    return username;
}

function renderDemoCredentials() {
    const teacher = state.users.find((user) => user.isDemo && user.role === "teacher");
    const student = state.users.find((user) => user.isDemo && user.role === "student");
    const hint = $("#demo-credentials");
    if (!hint || (!teacher && !student)) return;
    $("#demo-teacher-user").textContent = teacher ? `${teacher.username} / profe123` : "";
    $("#demo-student-user").textContent = student ? `${student.username} / alumno123` : "";
    hint.hidden = false;
}

function gradeFor(studentIdentification, courseId, areaId) {
    return state.grades.find((grade) => grade.studentIdentification === studentIdentification
        && grade.courseId === courseId && grade.areaId === areaId);
}

function teacherAreaIds(teacher) {
    const assigned = teacher?.areaIds?.filter((id) => AREAS.some((area) => area.id === id)) || [];
    return assigned.length ? [...new Set(assigned)] : AREAS.map((area) => area.id);
}

function teacherAreas(teacher) {
    return teacherAreaIds(teacher)
        .map((id) => AREAS.find((area) => area.id === id))
        .filter(Boolean);
}

function saveTeacherGrades(identification) {
    const teacher = linkedPerson(state.currentUser);
    const course = teacher?.courseId && state.courses.find((item) => item.id === teacher.courseId);
    const student = state.students.find((item) => item.identification === identification);
    const teacherAreasAllowed = teacherAreaIds(teacher);
    const row = Array.from(pageContent.querySelectorAll("tbody tr"))
        .find((item) => item.querySelector('[data-action="save-student-grades"]')?.dataset.id === identification);
    if (!teacher || !course || !student || !student.courseIds.includes(course.id) || !row) {
        showToast("No se pudo identificar al estudiante de tu curso.");
        return;
    }

    const updates = [];
    for (const input of row.querySelectorAll("[data-grade-area]")) {
        const areaId = input.dataset.gradeArea;
        if (!teacherAreasAllowed.includes(areaId)) {
            showToast("No tienes permiso para calificar esa área.");
            return;
        }
        if (!input.value.trim()) {
            updates.push({ areaId, value: null });
            continue;
        }
        const value = Number(input.value);
        if (!Number.isFinite(value) || value < 0 || value > 5
                || Math.abs(value * 10 - Math.round(value * 10)) > 1e-8) {
            showToast("Las notas deben estar entre 0 y 5, con máximo un decimal.");
            return;
        }
        updates.push({ areaId, value });
    }

    updates.forEach(({ areaId, value }) => {
        state.grades = state.grades.filter((grade) => !(grade.studentIdentification === identification
            && grade.courseId === course.id && grade.areaId === areaId));
        if (value !== null) {
            state.grades.push({
                studentIdentification: identification,
                courseId: course.id,
                areaId,
                value,
                updatedAt: new Date().toISOString()
            });
        }
    });
    const persisted = persistState();
    render();
    showToast(persisted ? "Calificaciones guardadas." : "Las notas cambiaron en pantalla, pero no se pudieron guardar.");
}

function persistState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 1,
            courses: state.courses,
            students: state.students,
            teachers: state.teachers,
            grades: state.grades,
            users: state.users
        }));
        return true;
    } catch (error) {
        storageNotice = "No se pudieron guardar los cambios en este navegador.";
        console.error("Error guardando datos de Aula:", error);
        showToast(storageNotice);
        return false;
    }
}

async function createPasswordCredential(password) {
    if (!window.crypto?.subtle) {
        throw new Error("La API Web Crypto no está disponible.");
    }
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    return {
        passwordSalt: bytesToBase64(salt),
        passwordHash: await derivePasswordHash(password, salt)
    };
}

async function verifyPassword(password, user) {
    if (!user) return false;
    if (typeof user.password === "string") return user.password === password;
    if (!user.passwordSalt || !user.passwordHash) return false;
    return await derivePasswordHash(password, base64ToBytes(user.passwordSalt)) === user.passwordHash;
}

async function derivePasswordHash(password, salt) {
    const material = await window.crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await window.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256"
    }, material, 256);
    return bytesToBase64(new Uint8Array(bits));
}

function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function showApplication() {
    loginScreen.hidden = true;
    appScreen.hidden = false;
    const user = state.currentUser;
    const person = linkedPerson(user);
    const displayName = person ? `${person.firstName} ${person.lastName}` : "Administrador";
    appScreen.dataset.role = user.role;
    $("#profile-name").textContent = displayName;
    $("#profile-role").textContent = roleLabel(user.role);
    $("#profile-avatar").textContent = displayName.charAt(0).toLocaleUpperCase("es");
    render();
}

function render() {
    renderNavigation();
    const [eyebrow, title] = pageInfo[state.activePage] || pageInfo.overview;
    $("#page-eyebrow").textContent = eyebrow;
    $("#page-title").textContent = title;

    if (state.currentUser.role === "admin") {
        if (state.activePage === "overview") renderOverview();
        else if (state.activePage === "students") renderPeople("students");
        else if (state.activePage === "teachers") renderPeople("teachers");
        else if (state.activePage === "courses") renderCourses();
        else if (state.activePage === "users") renderUsers();
        return;
    }
    if (state.activePage === "myStudents" && state.currentUser.role === "teacher") {
        renderTeacherStudents();
    } else if (state.currentUser.role === "student") {
        renderStudentDashboard();
    } else {
        renderMyCourses();
    }
}

function renderNavigation() {
    $("#main-nav").innerHTML = navByRole[state.currentUser.role].map(([page, icon, label]) => `
        <button class="nav-item ${state.activePage === page ? "active" : ""}" type="button" data-page="${page}">
            <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
        </button>
    `).join("");
}

function renderOverview() {
    const assignedStudents = state.students.filter((student) => student.courseIds.length).length;
    pageContent.innerHTML = `
        <div class="page-heading">
            <div><h2>Todo en un solo lugar</h2><p>Resumen actualizado de la comunidad escolar.</p></div>
            <div class="heading-actions">
                <button class="button button-secondary" data-action="add-course">＋ Nuevo curso</button>
                <button class="button button-primary" data-action="add-student">＋ Nuevo estudiante</button>
            </div>
        </div>
        <div class="stats-grid">
            ${statCard("Estudiantes", state.students.length, "♙")}
            ${statCard("Profesores", state.teachers.length, "♧")}
            ${statCard("Cursos", state.courses.length, "▤")}
            ${statCard("Con matrícula", assignedStudents, "✓")}
        </div>
        <section class="panel">
            <div class="panel-header"><div><h3>Planilla general</h3><p>Estudiantes, cursos y profesores asignados.</p></div></div>
            ${summaryTable()}
        </section>`;
}

function statCard(label, value, icon) {
    return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><p class="stat-value">${value}</p></article>`;
}

function summaryTable() {
    if (!state.students.length) return emptyState("Todavía no hay estudiantes", "Agrega estudiantes para ver la planilla general.");
    const rows = state.students.map((student) => {
        const courses = [...new Set(student.courseIds)]
            .map((courseId) => state.courses.find((item) => item.id === courseId))
            .filter(Boolean);
        const courseLabels = courses.length
            ? courses.map((course) => `<span class="badge">${escapeHtml(course.name)}</span>`).join(" ")
            : '<span class="badge badge-gray">Sin curso</span>';
        const teachers = [...new Set(courses.map((course) => teacherForCourse(course.id)).filter(Boolean))];
        const teacherLabels = teachers.length
            ? teachers.map((teacher) => escapeHtml(`${teacher.firstName} ${teacher.lastName}`)).join(", ")
            : '<span class="person-sub">Sin profesor</span>';
        return `<tr>
            <td>${personCell(student)}</td>
            <td>${escapeHtml(student.identification)}</td>
            <td>${courseLabels}</td>
            <td>${teacherLabels}</td>
        </tr>`;
    }).join("");
    return `<div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Identificación</th><th>Curso</th><th>Profesor</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderPeople(kind) {
    const isStudent = kind === "students";
    const people = state[kind];
    const title = isStudent ? "Estudiantes registrados" : "Profesores registrados";
    const action = isStudent ? "add-student" : "add-teacher";
    const label = isStudent ? "estudiantes" : "profesores";
    const rows = people.map((person) => {
        const assigned = isStudent
            ? person.courseIds.map((id) => state.courses.find((course) => course.id === id)).filter(Boolean)
                .map((course) => course.name).join(", ")
            : person.courseId
                ? `${state.courses.find((course) => course.id === person.courseId)?.name || ""} · ${teacherAreas(person).map((area) => area.name).join(", ")}`
                : "";
        const related = isStudent
            ? (assigned || "Sin curso")
            : (assigned || "Sin curso asignado");
        return `<tr data-searchable="${escapeAttr(`${person.firstName} ${person.lastName} ${person.identification} ${related}`.toLocaleLowerCase("es"))}">
            <td>${personCell(person)}</td>
            <td>${escapeHtml(person.identification)}</td>
            <td>${escapeHtml(related)}</td>
            <td><div class="row-actions">
                ${isStudent
                    ? `<button class="button button-secondary button-small" data-action="assign-student-course" data-id="${escapeAttr(person.identification)}">${person.courseIds.length ? "Cambiar curso" : "Asignar curso"}</button>`
                    : `<button class="button button-secondary button-small" data-action="assign-teacher-course" data-id="${escapeAttr(person.identification)}">${person.courseId ? "Cambiar curso" : "Asignar curso"}</button>`}
                <button class="button button-secondary button-small" data-action="edit-${isStudent ? "student" : "teacher"}" data-id="${escapeAttr(person.identification)}">Editar</button>
                <button class="button button-danger button-small" data-action="delete-${isStudent ? "student" : "teacher"}" data-id="${escapeAttr(person.identification)}">Eliminar</button>
            </div></td>
        </tr>`;
    }).join("");

    pageContent.innerHTML = `
        <div class="page-heading"><div><h2>${title}</h2><p>Administra perfiles y asignaciones académicas.</p></div>
            <button class="button button-primary" data-action="${action}">＋ Agregar ${isStudent ? "estudiante" : "profesor"}</button>
        </div>
        <section class="panel">
            <div class="panel-header"><div><h3>Lista de ${label}</h3><p>${people.length} registro${people.length === 1 ? "" : "s"}</p></div>
                <input class="search-input" data-search placeholder="Buscar por nombre, identificación o curso" aria-label="Buscar ${label}">
            </div>
            ${people.length ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Identificación</th><th>${isStudent ? "Cursos" : "Curso asignado"}</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState(`No hay ${label} todavía`, `Usa el botón para agregar ${isStudent ? "el primer estudiante" : "el primer profesor"}.`)}
        </section>`;
}

function renderCourses() {
    const rows = state.courses.map((course) => {
        const teacher = teacherForCourse(course.id);
        const students = state.students.filter((student) => student.courseIds.includes(course.id)).length;
        return `<tr data-searchable="${escapeAttr(`${course.name} ${course.code} ${teacher ? teacher.firstName + " " + teacher.lastName : ""}`.toLocaleLowerCase("es"))}">
            <td><span class="badge">${escapeHtml(course.code)}</span></td>
            <td><strong>${escapeHtml(course.name)}</strong></td>
            <td>${teacher ? escapeHtml(`${teacher.firstName} ${teacher.lastName}`) : '<span class="person-sub">Sin profesor asignado</span>'}</td>
            <td>${students}</td>
            <td><div class="row-actions"><button class="button button-secondary button-small" data-action="edit-course" data-id="${escapeAttr(course.id)}">Editar</button>
                <button class="button button-danger button-small" data-action="delete-course" data-id="${escapeAttr(course.id)}">Eliminar</button></div></td>
        </tr>`;
    }).join("");
    pageContent.innerHTML = `
        <div class="page-heading"><div><h2>Catálogo de cursos</h2><p>Cada curso puede tener un único profesor responsable.</p></div>
            <button class="button button-primary" data-action="add-course">＋ Crear curso</button>
        </div>
        <section class="panel">
            <div class="panel-header"><div><h3>Cursos</h3><p>${state.courses.length} curso${state.courses.length === 1 ? "" : "s"}</p></div>
                <input class="search-input" data-search placeholder="Buscar curso" aria-label="Buscar curso">
            </div>
            ${state.courses.length ? `<div class="table-wrap"><table><thead><tr><th>Código</th><th>Nombre</th><th>Profesor</th><th>Estudiantes</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState("No hay cursos todavía", "Crea un curso para comenzar a organizar las clases.")}
        </section>`;
}

function renderUsers() {
    const rows = state.users.map((user) => {
        const person = linkedPerson(user);
        const personName = person ? `${person.firstName} ${person.lastName}` : "Cuenta del sistema";
        return `<tr data-searchable="${escapeAttr(`${user.username} ${roleLabel(user.role)} ${personName}`.toLocaleLowerCase("es"))}">
            <td><strong>${escapeHtml(user.username)}</strong></td>
            <td><span class="badge ${user.role === "admin" ? "badge-green" : ""}">${roleLabel(user.role)}</span></td>
            <td>${escapeHtml(personName)}</td>
            <td>${user.role === "admin" ? '<span class="person-sub">Cuenta inicial</span>' : `<button class="button button-danger button-small" data-action="delete-user" data-id="${escapeAttr(user.username)}">Eliminar acceso</button>`}</td>
        </tr>`;
    }).join("");
    pageContent.innerHTML = `
        <div class="page-heading"><div><h2>Usuarios y permisos</h2><p>Crea accesos vinculados a los perfiles escolares.</p></div>
            <button class="button button-primary" data-action="add-user">＋ Crear usuario</button>
        </div>
        <section class="panel">
            <div class="panel-header"><div><h3>Cuentas de acceso</h3><p>El menú visible depende del rol.</p></div></div>
            <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Perfil vinculado</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div>
        </section>
        <p class="security-note">Las contraseñas de este prototipo no se envían a ningún servidor. No uses claves reales.</p>`;
}

function renderMyCourses() {
    const user = state.currentUser;
    const person = linkedPerson(user);
    const courses = user.role === "student"
        ? state.courses.filter((course) => person?.courseIds.includes(course.id))
        : state.courses.filter((course) => course.id === person?.courseId);
    const roleText = user.role === "student" ? "estudiante" : "profesor";
    const greeting = person ? `${person.firstName} ${person.lastName}` : user.username;
    pageContent.innerHTML = `
        <section class="welcome-card"><p class="eyebrow">TU ESPACIO PERSONAL</p><h2>Hola, ${escapeHtml(greeting)} 👋</h2>
            <p>${user.role === "student" ? "Aquí puedes consultar tus cursos y profesores." : "Estos son los cursos que tienes a cargo."}</p>
        </section>
        <div class="page-heading"><div><h2>${user.role === "student" ? "Cursos matriculados" : "Cursos asignados"}</h2><p>Información asociada a tu perfil de ${roleText}.</p></div></div>
        ${courses.length ? `<div class="student-course-grid">${courses.map((course) => {
            const teacher = teacherForCourse(course.id);
            const count = state.students.filter((student) => student.courseIds.includes(course.id)).length;
            const areas = user.role === "teacher" ? teacherAreas(teacher) : [];
            return `<article class="course-card"><span class="course-code">${escapeHtml(course.code)}</span><h3>${escapeHtml(course.name)}</h3>
                <div class="course-teacher"><span class="person-initial">${teacher ? escapeHtml(teacher.firstName.charAt(0)) : "?"}</span>
                    <span>${teacher ? `Prof. ${escapeHtml(`${teacher.firstName} ${teacher.lastName}`)}` : "Profesor pendiente"}${user.role === "teacher" ? ` · ${count} estudiantes` : ""}</span></div>
                ${areas.length ? `<div class="course-areas">${areas.map((area) => `<span class="badge">${escapeHtml(area.name)}</span>`).join("")}</div>` : ""}</article>`;
        }).join("")}</div>` : `<div class="no-data"><strong>Aún no tienes cursos asignados</strong>Consulta con administración para revisar tu matrícula.</div>`}`;
}

function renderStudentDashboard() {
    const student = linkedPerson(state.currentUser);
    const course = student?.courseIds
        .map((courseId) => state.courses.find((item) => item.id === courseId))
        .find(Boolean);
    const teacher = course && teacherForCourse(course.id);
    const greeting = student ? `${student.firstName} ${student.lastName}` : state.currentUser.username;
    const rows = course ? AREAS.map((area) => {
        const grade = gradeFor(student.identification, course.id, area.id);
        const areaTeacher = teacher && teacherAreaIds(teacher).includes(area.id) ? teacher : null;
        return `<tr>
            <td><strong>${escapeHtml(area.name)}</strong></td>
            <td>${grade ? `<span class="grade-value">${escapeHtml(Number(grade.value).toFixed(1))} / 5</span>` : '<span class="person-sub">Pendiente</span>'}</td>
            <td>${areaTeacher ? escapeHtml(`${areaTeacher.firstName} ${areaTeacher.lastName}`) : '<span class="person-sub">Sin docente asignado</span>'}</td>
        </tr>`;
    }).join("") : "";
    pageContent.innerHTML = `
        <section class="welcome-card"><p class="eyebrow">ESPACIO DEL ESTUDIANTE</p><h2>Hola, ${escapeHtml(greeting)} 👋</h2>
            <p>Consulta tu curso, docentes y notas por área.</p>
        </section>
        <div class="student-info-grid">
            <article class="student-info-card"><span>Curso actual</span><strong>${course ? escapeHtml(course.name) : "Sin curso asignado"}</strong>
                ${course ? `<small>Código ${escapeHtml(course.code)}</small>` : "<small>Solicita a administración que te asigne un curso.</small>"}</article>
            <article class="student-info-card"><span>Profesor responsable</span><strong>${teacher ? escapeHtml(`${teacher.firstName} ${teacher.lastName}`) : "Pendiente"}</strong>
                <small>Las notas se actualizan cuando tu profesor las registra.</small></article>
        </div>
        <section class="panel">
            <div class="panel-header"><div><h3>Mis notas por área</h3><p>Escala de calificación: 0 a 5.</p></div></div>
            ${course ? `<div class="table-wrap"><table><thead><tr><th>Área</th><th>Nota</th><th>Docente</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState("No hay curso para mostrar", "Cuando tengas una matrícula, tus áreas y notas aparecerán aquí.")}
        </section>`;
}

function renderTeacherStudents() {
    const teacher = linkedPerson(state.currentUser);
    const course = teacher?.courseId && state.courses.find((item) => item.id === teacher.courseId);
    const areas = teacherAreas(teacher);
    const students = course ? state.students.filter((item) => item.courseIds.includes(course.id)) : [];
    const rows = students.map((student) => `<tr>
        <td>${personCell(student)}</td>
        <td>${escapeHtml(student.identification)}</td>
        ${areas.map((area) => {
            const grade = gradeFor(student.identification, course.id, area.id);
            return `<td><label class="grade-input-label"><span class="visually-hidden">${escapeHtml(area.name)}</span>
                <input type="number" min="0" max="5" step="0.1" inputmode="decimal" data-grade-area="${escapeAttr(area.id)}"
                    value="${grade ? escapeAttr(grade.value) : ""}" placeholder="—" aria-label="Nota de ${escapeAttr(area.name)} para ${escapeAttr(student.firstName)}"></label></td>`;
        }).join("")}
        <td><button class="button button-primary button-small" data-action="save-student-grades" data-id="${escapeAttr(student.identification)}">Guardar notas</button></td>
    </tr>`).join("");
    pageContent.innerHTML = `
        <div class="page-heading"><div><h2>Estudiantes y calificaciones</h2><p>${course ? `${escapeHtml(course.name)} · ${areas.map((area) => escapeHtml(area.name)).join(", ")}` : "No tienes un curso asignado todavía."}</p></div></div>
        <section class="panel"><div class="panel-header"><div><h3>Lista de mi curso</h3><p>${students.length} estudiante${students.length === 1 ? "" : "s"} · calificaciones de 0 a 5</p></div></div>
            ${students.length ? `<div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Identificación</th>${areas.map((area) => `<th>${escapeHtml(area.name)}</th>`).join("")}<th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState(course ? "No hay estudiantes en este curso" : "No hay curso asignado", "Cuando administración asigne estudiantes, aparecerán aquí.")}</section>`;
}

function personCell(person) {
    const name = `${person.firstName} ${person.lastName}`;
    return `<div class="person-cell"><span class="person-initial">${escapeHtml(person.firstName.charAt(0).toLocaleUpperCase("es"))}</span><span><span class="person-name">${escapeHtml(name)}</span><span class="person-sub">${escapeHtml(person.identification)}</span></span></div>`;
}

function emptyState(title, message) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong>${escapeHtml(message)}</div>`;
}

function openDialog(title, fields, handler, saveLabel = "Guardar") {
    $("#dialog-title").textContent = title;
    $("#dialog-fields").innerHTML = fields;
    $("#dialog-error").textContent = "";
    $("#dialog-save").textContent = saveLabel;
    dialogForm.dataset.handler = handler;
    restoreFormDraft(handler);
    dialog.showModal();
}

function textField(name, label, options = {}) {
    const inputType = options.type || "text";
    const pattern = options.pattern ? ` pattern="${options.pattern}"` : "";
    const inputMode = options.inputMode ? ` inputmode="${options.inputMode}"` : "";
    const filter = options.filter ? ` data-filter="${options.filter}"` : "";
    const maxLength = options.maxLength ? ` maxlength="${options.maxLength}"` : "";
    const minLength = options.minLength ? ` minlength="${options.minLength}"` : "";
    const placeholder = options.placeholder ? ` placeholder="${escapeAttr(options.placeholder)}"` : "";
    const value = options.value !== undefined ? ` value="${escapeAttr(options.value)}"` : "";
    return `<label>${label}<input name="${name}" type="${inputType}"${pattern}${inputMode}${filter}${maxLength}${minLength}${placeholder}${value} required></label>`;
}

function selectField(name, label, options, hint = "", selectedValue = "") {
    const optionMarkup = options.map(([value, text]) => `<option value="${escapeAttr(value)}"${value === selectedValue ? " selected" : ""}>${escapeHtml(text)}</option>`).join("");
    return `<label>${label}<select name="${name}" required><option value="">Selecciona una opción</option>${optionMarkup}</select>${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}</label>`;
}

function openStudentDialog() {
    openDialog("Agregar estudiante", [
        textField("identification", "Identificación", { pattern: "[0-9]+", inputMode: "numeric", filter: "digits", maxLength: 20 }),
        textField("firstName", "Nombre", { filter: "letters" }),
        textField("lastName", "Apellido", { filter: "letters" }),
        `<label>Fecha de nacimiento<input name="birthDate" type="date" max="${latestAllowedBirthDate()}" required><span class="field-hint">Edad mínima: 17 años.</span></label>`
    ].join(""), "saveStudent");
}

function openTeacherDialog() {
    openDialog("Agregar profesor", [
        textField("identification", "Identificación", { pattern: "[0-9]+", inputMode: "numeric", filter: "digits", maxLength: 20 }),
        textField("firstName", "Nombre", { filter: "letters" }),
        textField("lastName", "Apellido", { filter: "letters" }),
        `<label>Fecha de nacimiento<input name="birthDate" type="date" max="${latestAllowedBirthDate()}" required><span class="field-hint">Edad mínima: 17 años.</span></label>`
    ].join(""), "saveTeacher");
}

function openPersonEditDialog(kind, identification) {
    const person = state[kind].find((item) => item.identification === identification);
    if (!person) return;
    const today = new Date();
    today.setFullYear(today.getFullYear() - person.age);
    const birthDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const type = kind === "students" ? "estudiante" : "profesor";
    openDialog(`Editar ${type}`, [
        textField("identification", "Identificación", { value: person.identification, pattern: "[0-9]+", inputMode: "numeric", filter: "digits", maxLength: 20 }),
        textField("firstName", "Nombre", { value: person.firstName, filter: "letters" }),
        textField("lastName", "Apellido", { value: person.lastName, filter: "letters" }),
        `<label>Fecha de nacimiento<input name="birthDate" type="date" value="${birthDate}" max="${latestAllowedBirthDate()}" required><span class="field-hint">Edad permitida: de 17 a 99 años.</span></label>`
    ].join(""), kind === "students" ? "editStudent" : "editTeacher");
    dialogForm.dataset.identification = identification;
}

function openCourseDialog() {
    openDialog("Crear curso", [
        textField("code", "Código", { pattern: "[0-9]+", inputMode: "numeric", maxLength: 12 }),
        textField("name", "Nombre del curso", { maxLength: 80 })
    ].join(""), "saveCourse");
}

function openCourseEditDialog(id) {
    const course = state.courses.find((item) => item.id === id);
    if (!course) return;
    openDialog("Editar curso", [
        textField("code", "Código", { value: course.code, pattern: "[0-9]+", inputMode: "numeric", maxLength: 12 }),
        textField("name", "Nombre del curso", { value: course.name, maxLength: 80 })
    ].join(""), "editCourse");
    dialogForm.dataset.courseId = id;
}

function openUserDialog() {
    const roleOptions = [];
    if (state.students.some((person) => !hasAccount("student", person.identification))) roleOptions.push(["student", "Estudiante"]);
    if (state.teachers.some((person) => !hasAccount("teacher", person.identification))) roleOptions.push(["teacher", "Profesor"]);
    if (!roleOptions.length) {
        showToast("Agrega perfiles sin cuenta para poder crear usuarios.");
        return;
    }
    const people = (role) => {
        const list = (role === "student" ? state.students : state.teachers)
            .filter((person) => !hasAccount(role, person.identification));
        return list.map((person) => `<option value="${escapeAttr(person.identification)}">${escapeHtml(`${person.firstName} ${person.lastName} · ${person.identification}`)}</option>`).join("");
    };
    const roleChoices = roleOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    const fields = `
        <label>Tipo de cuenta<select name="role" id="account-role" required>${roleChoices}</select></label>
        <label>Perfil vinculado<select name="identification" id="account-person" required></select></label>
        ${textField("username", "Nombre de usuario", { minLength: 3, maxLength: 30 })}
        ${textField("password", "Contraseña", { type: "password" })}
        <span class="field-hint">La cuenta quedará asociada al perfil seleccionado.</span>`;
    openDialog("Crear acceso", fields, "saveUser");
    const roleSelect = $("#account-role");
    const personSelect = $("#account-person");
    const updatePeople = () => {
        personSelect.innerHTML = `<option value="">Selecciona una persona</option>${people(roleSelect.value)}`;
        restoreFormDraft("saveUser");
    };
    roleSelect.addEventListener("change", updatePeople);
    updatePeople();
}

function openStudentCourseDialog(identification) {
    const student = state.students.find((person) => person.identification === identification);
    if (!student) return;
    const options = state.courses.map((course) => [course.id, `${course.code} · ${course.name}`]);
    if (!options.length) {
        showToast("Primero crea un curso.");
        return;
    }
    const currentCourseId = student.courseIds.find((courseId) => state.courses.some((course) => course.id === courseId)) || "";
    const hint = currentCourseId
        ? "Cada estudiante puede tener un solo curso. Al guardar, se reemplazará el curso actual."
        : "Cada estudiante puede tener un solo curso.";
    openDialog(
        `${currentCourseId ? "Cambiar" : "Asignar"} curso a ${student.firstName}`,
        selectField("courseId", "Curso", options, hint, currentCourseId),
        "assignStudentCourse"
    );
    dialogForm.dataset.identification = identification;
}

function openTeacherCourseDialog(identification) {
    const teacher = state.teachers.find((person) => person.identification === identification);
    if (!teacher) return;
    const options = state.courses
        .filter((course) => course.id === teacher.courseId || !teacherForCourse(course.id))
        .map((course) => [course.id, `${course.code} · ${course.name}`]);
    if (!options.length) {
        showToast("Todos los cursos ya tienen un profesor asignado.");
        return;
    }
    const selectedAreas = teacher.areaIds || AREAS.map((area) => area.id);
    openDialog(`Asignar curso y áreas a ${teacher.firstName}`, [
        selectField("courseId", "Curso", options, "", teacher.courseId || ""),
        areaCheckboxField(selectedAreas)
    ].join(""), "assignTeacherCourse");
    dialogForm.dataset.identification = identification;
}

function areaCheckboxField(selectedAreaIds = []) {
    return `<fieldset class="area-picker"><legend>Áreas que imparte</legend><div class="area-options">
        ${AREAS.map((area) => `<label><input type="checkbox" name="areaIds" value="${escapeAttr(area.id)}"${selectedAreaIds.includes(area.id) ? " checked" : ""}>${escapeHtml(area.name)}</label>`).join("")}
        </div><span class="field-hint">El profesor podrá consultar y calificar estudiantes en estas áreas.</span></fieldset>`;
}

const dialogHandlers = {
    saveStudent(form) {
        const person = readPerson(form);
        if (!person) return;
        if (state.students.some((item) => item.identification === person.identification)
                || state.teachers.some((item) => item.identification === person.identification)) {
            return dialogError("Esa identificación ya está registrada.");
        }
        state.students.push({ ...person, courseIds: [] });
        saved("Estudiante agregado.", "students");
    },
    saveTeacher(form) {
        const person = readPerson(form);
        if (!person) return;
        if (state.students.some((item) => item.identification === person.identification)
                || state.teachers.some((item) => item.identification === person.identification)) {
            return dialogError("Esa identificación ya está registrada.");
        }
        state.teachers.push({ ...person, courseId: null });
        saved("Profesor agregado.", "teachers");
    },
    editStudent(form) {
        updatePerson("students", form);
    },
    editTeacher(form) {
        updatePerson("teachers", form);
    },
    saveCourse(form) {
        const code = String(form.get("code")).trim();
        const name = String(form.get("name")).trim();
        if (!/^\d+$/.test(code) || !name) return dialogError("Completa un código numérico y el nombre del curso.");
        if (state.courses.some((course) => course.code === code)) return dialogError("Ya existe un curso con ese código.");
        state.courses.push({ id: makeId(), code, name });
        saved("Curso creado.", "courses");
    },
    editCourse(form) {
        const id = dialogForm.dataset.courseId;
        const course = state.courses.find((item) => item.id === id);
        const code = String(form.get("code")).trim();
        const name = String(form.get("name")).trim();
        if (!course || !/^\d+$/.test(code) || !name) return dialogError("Completa un código numérico y el nombre del curso.");
        if (state.courses.some((item) => item.id !== id && item.code === code)) return dialogError("Ya existe un curso con ese código.");
        course.code = code;
        course.name = name;
        saved("Curso actualizado.", "courses");
    },
    async saveUser(form) {
        const role = String(form.get("role"));
        const identification = String(form.get("identification"));
        const username = String(form.get("username")).trim();
        const password = String(form.get("password"));
        if (!/^[\p{L}\p{N}_.-]{3,30}$/u.test(username)) return dialogError("El usuario debe tener 3 a 30 letras, números, puntos, guiones o guiones bajos.");
        if (!password) return dialogError("Escribe una contraseña.");
        if (state.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) return dialogError("Ese nombre de usuario ya existe.");
        const person = role === "student"
            ? state.students.find((item) => item.identification === identification)
            : state.teachers.find((item) => item.identification === identification);
        if (!person || hasAccount(role, identification)) return dialogError("Selecciona un perfil disponible.");
        const saveButton = $("#dialog-save");
        saveButton.disabled = true;
        try {
            const credential = await createPasswordCredential(password);
            state.users.push({ username, role, identification, ...credential });
        } catch (error) {
            console.error("No se pudo crear el acceso de usuario:", error);
            return dialogError("No se pudo proteger la contraseña en este navegador.");
        } finally {
            saveButton.disabled = false;
        }
        saved("Acceso creado. La persona ya puede iniciar sesión.", "users");
    },
    assignStudentCourse(form) {
        const student = state.students.find((person) => person.identification === dialogForm.dataset.identification);
        const courseId = String(form.get("courseId"));
        if (!student || !state.courses.some((course) => course.id === courseId)) return dialogError("Selecciona un curso válido.");
        student.courseIds = [courseId];
        saved("Curso asignado al estudiante.", "students");
    },
    assignTeacherCourse(form) {
        const teacher = state.teachers.find((person) => person.identification === dialogForm.dataset.identification);
        const courseId = String(form.get("courseId"));
        const areaIds = form.getAll("areaIds").map(String);
        const currentOwner = teacherForCourse(courseId);
        if (!teacher || !state.courses.some((course) => course.id === courseId)
                || (currentOwner && currentOwner !== teacher)) {
            return dialogError("Ese curso ya está asignado a otro profesor.");
        }
        if (!areaIds.length || areaIds.some((id) => !AREAS.some((area) => area.id === id))) {
            return dialogError("Selecciona al menos un área válida.");
        }
        teacher.courseId = courseId;
        teacher.areaIds = [...new Set(areaIds)];
        saved("Curso asignado al profesor.", "teachers");
    }
};

function readPerson(form) {
    const identification = String(form.get("identification")).trim();
    const firstName = String(form.get("firstName")).trim();
    const lastName = String(form.get("lastName")).trim();
    const birthDate = String(form.get("birthDate"));
    const age = calculateAge(birthDate);
    if (!/^\d+$/.test(identification)) {
        dialogError("La identificación solo puede contener números.");
        return null;
    }
    if (!validName(firstName) || !validName(lastName)) {
        dialogError("Nombre y apellido deben contener solo letras, espacios, apóstrofes o guiones.");
        return null;
    }
    if (!Number.isInteger(age) || age < 17 || age > 99) {
        dialogError("La fecha de nacimiento debe ser válida y corresponder a una edad entre 17 y 99 años.");
        return null;
    }
    return { identification, firstName, lastName, age };
}

function latestAllowedBirthDate(minimumAge = 17) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - minimumAge);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function updatePerson(kind, form) {
    const originalIdentification = dialogForm.dataset.identification;
    const person = state[kind].find((item) => item.identification === originalIdentification);
    const updated = readPerson(form);
    if (!updated || !person) return;
    if (updated.identification !== originalIdentification
            && (state.students.some((item) => item.identification === updated.identification)
                || state.teachers.some((item) => item.identification === updated.identification))) {
        return dialogError("Esa identificación ya está registrada.");
    }
    person.identification = updated.identification;
    person.firstName = updated.firstName;
    person.lastName = updated.lastName;
    person.age = updated.age;
    state.users.forEach((user) => {
        if (user.identification === originalIdentification) user.identification = updated.identification;
    });
    saved("Registro actualizado.", kind);
}

function calculateAge(birthDate) {
    const date = new Date(`${birthDate}T00:00:00`);
    if (!birthDate || Number.isNaN(date.getTime()) || date > new Date()) return NaN;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    if (now.getMonth() < date.getMonth()
            || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) age--;
    return age;
}

function validName(value) {
    return /^[\p{L}\s'-]+$/u.test(value);
}

function saved(message, page) {
    const persisted = persistState();
    dialog.close();
    state.activePage = page;
    render();
    showToast(persisted ? message : "El cambio se aplicó, pero no se pudo guardar en este navegador.");
}

function dialogError(message) {
    $("#dialog-error").textContent = message;
}

function deleteRecord(kind, identification) {
    const person = state[kind].find((item) => item.identification === identification);
    if (!person || !window.confirm(`¿Eliminar a ${person.firstName} ${person.lastName}?`)) return;
    state[kind] = state[kind].filter((item) => item !== person);
    if (kind === "students") {
        state.grades = state.grades.filter((grade) => grade.studentIdentification !== identification);
    }
    state.users = state.users.filter((user) => user.identification !== identification);
    const persisted = persistState();
    render();
    showToast(persisted ? "Registro eliminado." : "Se eliminó en pantalla, pero no se pudo guardar en este navegador.");
}

function deleteCourse(id) {
    const course = state.courses.find((item) => item.id === id);
    if (!course || !window.confirm(`¿Eliminar el curso "${course.name}" y quitarlo de las matrículas?`)) return;
    state.courses = state.courses.filter((item) => item.id !== id);
    state.students.forEach((student) => {
        student.courseIds = student.courseIds.filter((courseId) => courseId !== id);
    });
    state.teachers.forEach((teacher) => {
        if (teacher.courseId === id) teacher.courseId = null;
    });
    state.grades = state.grades.filter((grade) => grade.courseId !== id);
    const persisted = persistState();
    render();
    showToast(persisted ? "Curso eliminado." : "Se eliminó en pantalla, pero no se pudo guardar en este navegador.");
}

function deleteUser(username) {
    if (!window.confirm(`¿Quitar el acceso de "${username}"?`)) return;
    state.users = state.users.filter((user) => user.username !== username);
    const persisted = persistState();
    render();
    showToast(persisted ? "Acceso eliminado." : "Se eliminó en pantalla, pero no se pudo guardar en este navegador.");
}

function teacherForCourse(courseId) {
    return state.teachers.find((teacher) => teacher.courseId === courseId) || null;
}

function hasAccount(role, identification) {
    return state.users.some((user) => user.role === role && user.identification === identification);
}

function linkedPerson(user) {
    if (!user || user.role === "admin") return null;
    const list = user.role === "student" ? state.students : state.teachers;
    return list.find((person) => person.identification === user.identification) || null;
}

function roleLabel(role) {
    return ({ admin: "Administrador", teacher: "Profesor", student: "Estudiante" })[role] || role;
}

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function escapeAttr(value) {
    return escapeHtml(value);
}

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastElement.classList.remove("visible"), 2600);
}
