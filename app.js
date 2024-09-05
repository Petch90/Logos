// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyj9OleUwdGw5NSDB83ORoYc8rDXzwJ4E",
  authDomain: "logocheck-30cbe.firebaseapp.com",
  projectId: "logocheck-30cbe",
  storageBucket: "logocheck-30cbe.appspot.com",
  messagingSenderId: "670897845298",
  appId: "1:670897845298:web:5de8302a360e2c1f9af82b",
  measurementId: "G-MBHQRZ0TNJ"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Riferimenti a Firestore e Auth
const db = firebase.firestore();
const auth = firebase.auth();

function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Utente registrato:", userCredential.user);
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
            console.log("Accesso effettuato:", userCredential.user);
            document.getElementById('auth').style.display = 'none';
            document.getElementById('appointments').style.display = 'block';
            loadAppointments();
        })
        .catch((error) => {
            console.error("Errore di accesso:", error);
        });
}

function addAppointment() {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    db.collection('appointments').add({
        date: date,
        time: time,
        userId: auth.currentUser.uid
    })
    .then(() => {
        console.log("Appuntamento aggiunto");
        loadAppointments();
    })
    .catch((error) => {
        console.error("Errore nell'aggiunta dell'appuntamento:", error);
    });
}

function loadAppointments() {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';
    db.collection('appointments')
        .where('userId', '==', auth.currentUser.uid)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const appointment = doc.data();
                appointmentList.innerHTML += `<p>${appointment.date} ${appointment.time}</p>`;
            });
        })
        .catch((error) => {
            console.error("Errore nel caricamento degli appuntamenti:", error);
        });
}

// Ascolta i cambiamenti dello stato di autenticazione
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('appointments').style.display = 'block';
        loadAppointments();
    } else {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('appointments').style.display = 'none';
    }
});
