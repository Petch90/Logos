// Configurazione Firebase
const firebaseConfig = {
  // Le tue credenziali Firebase qui
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Riferimenti a Firestore e Auth
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;

function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            checkUserRole();
        })
        .catch((error) => {
            console.error("Errore di registrazione:", error);
        });
}

function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            checkUserRole();
        })
        .catch((error) => {
            console.error("Errore di accesso:", error);
        });
}

function checkUserRole() {
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists && doc.data().isAdmin) {
                showAdminPanel();
            } else {
                showUserPanel();
            }
        })
        .catch((error) => {
            console.error("Errore nel recupero del ruolo utente:", error);
        });
}

function showAdminPanel() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function showUserPanel() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';
    generateCalendar();
    loadAppointments();
}

function generateCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    const currentDate = new Date();
    const monthDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= monthDays; i++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.textContent = i;
        dayEl.onclick = () => openAppointmentModal(i);
        calendarEl.appendChild(dayEl);
    }
}

function openAppointmentModal(day) {
    const modal = document.getElementById('appointmentModal');
    const modalDate = document.getElementById('modalDate');
    const timeSlots = document.getElementById('timeSlots');
    const currentDate = new Date();
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    modalDate.textContent = selectedDate.toLocaleDateString();
    timeSlots.innerHTML = '';

    for (let hour = 9; hour < 18; hour++) {
        const slot = document.createElement('div');
        slot.classList.add('time-slot');
        slot.textContent = `${hour}:00`;
        slot.onclick = () => bookAppointment(selectedDate, hour);
        timeSlots.appendChild(slot);
    }

    modal.style.display = 'block';
}

function bookAppointment(date, hour) {
    const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
    db.collection('appointments').add({
        date: appointmentDate,
        userId: currentUser.uid
    })
    .then(() => {
        console.log("Appuntamento prenotato");
        document.getElementById('appointmentModal').style.display = 'none';
        loadAppointments();
    })
    .catch((error) => {
        console.error("Errore nella prenotazione:", error);
    });
}

function loadAppointments() {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';
    db.collection('appointments')
        .where('userId', '==', currentUser.uid)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const appointment = doc.data();
                const li = document.createElement('li');
                li.textContent = new Date(appointment.date.toDate()).toLocaleString();
                appointmentList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Errore nel caricamento degli appuntamenti:", error);
        });
}

function showUserManagement() {
    document.getElementById('userManagement').style.display = 'block';
    document.getElementById('appointmentManagement').style.display = 'none';
    loadUsers();
}

function showAppointmentManagement() {
    document.getElementById('userManagement').style.display = 'none';
    document.getElementById('appointmentManagement').style.display = 'block';
    loadAllAppointments();
}

function createUser() {
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                email: email,
                isAdmin: false
            })
            .then(() => {
                console.log("Nuovo utente creato");
                loadUsers();
            });
        })
        .catch((error) => {
            console.error("Errore nella creazione dell'utente:", error);
        });
}

function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    db.collection('users').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const li = document.createElement('li');
                li.textContent = `${user.email} - ${user.isAdmin ? 'Admin' : 'User'}`;
                userList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Errore nel caricamento degli utenti:", error);
        });
}

function loadAllAppointments() {
    const appointmentList = document.getElementById('adminAppointmentList');
    appointmentList.innerHTML = '';
    db.collection('appointments').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const appointment = doc.data();
                const li = document.createElement('li');
                li.textContent = `${new Date(appointment.date.toDate()).toLocaleString()} - User ID: ${appointment.userId}`;
                appointmentList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Errore nel caricamento degli appuntamenti:", error);
        });
}

// Event listener per chiudere la modal
document.querySelector('.close').onclick = function() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Ascolta i cambiamenti dello stato di autenticazione
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        checkUserRole();
    } else {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('userPanel').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
    }
});
