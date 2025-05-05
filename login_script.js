// Firebase configuration
/*
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
*/

// Inicializar Firebase y Firestore
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// HTML Elements
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const userDetails = document.getElementById('user-details');
const userName = document.getElementById('user-name');
const userPic = document.getElementById('user-pic');

// Evento de Login
loginButton.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  try {
    const result = await auth.signInWithPopup(provider);
    const token = result.credential.accessToken;
    localStorage.setItem('driveToken', token);

    const user = result.user;
    const email = user.email.toLowerCase();
    const doc = await db.collection("usuariosAutorizados").doc(email).get();

    if (doc.exists && doc.data().autorizado === true) {
      displayUser(user);
      window.location.href = "https://www.youtube.com/watch?v=hMFmvtq_CWo";
    } else {
      alert("❌ Este usuario no está autorizado.");
      await auth.signOut();
    }

  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
  }
});

// Evento de Logout
logoutButton.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      hideUser();
    })
    .catch(error => {
      console.error("Error durante el cierre de sesión:", error);
    });
});

// Mostrar info del usuario
const displayUser = (user) => {
  userName.textContent = `Hola, ${user.displayName}`;
  userPic.src = user.photoURL;
  userDetails.style.display = '';
  loginButton.style.display = 'none';
  logoutButton.style.display = '';
};

// Ocultar info del usuario
const hideUser = () => {
  userDetails.style.display = 'none';
  loginButton.style.display = '';
  logoutButton.style.display = 'none';
};

// Mantener estado si ya ha estado loggeado
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const email = user.email.toLowerCase();
    const doc = await db.collection("usuariosAutorizados").doc(email).get();

    if (doc.exists && doc.data().autorizado === true) {
      displayUser(user);

      // Crear botón "Entrar" si no existe
      if (!document.getElementById('entrar')) {
        const entrarButton = document.createElement('button');
        entrarButton.textContent = 'Entrar';
        entrarButton.id = 'entrar';
        entrarButton.className = 'btn-control btn-iniciar';
        entrarButton.onclick = () => {
          window.location.href = "https://www.youtube.com/watch?v=hMFmvtq_CWo";
        };

        userDetails.appendChild(entrarButton);
      }

    } else {
      await auth.signOut();
      hideUser();
    }

  } else {
    hideUser();
  }
});
