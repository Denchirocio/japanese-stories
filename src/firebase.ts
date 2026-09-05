import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  indexedDBLocalPersistence,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

let userPromise: Promise<User> | null = null

// Backup automático sin pantalla de login: cada dispositivo se loguea solo
// como un usuario anónimo, invisible para la usuaria.
function getUser(): Promise<User> {
  if (!userPromise) {
    // Hay que esperar el PRIMER estado real de auth (que refleja la sesión
    // ya persistida, si existe) antes de decidir si hace falta crear una
    // nueva. Llamar a signInAnonymously() sin esperar corre el riesgo de
    // ganarle la carrera a la restauración de la sesión guardada y crear un
    // usuario nuevo, huérfano del backup anterior.
    userPromise = setPersistence(auth, indexedDBLocalPersistence).then(
      () =>
        new Promise((resolve, reject) => {
          const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
              unsubscribe()
              if (user) {
                resolve(user)
              } else {
                signInAnonymously(auth)
                  .then((cred) => resolve(cred.user))
                  .catch(reject)
              }
            },
            reject,
          )
        }),
    )
  }
  return userPromise
}

// El SDK de Firestore usa un canal de streaming (WebChannel) que queda
// colgado detrás de algunos antivirus/proxys que inspeccionan HTTPS. Se
// evita del todo llamando a la API REST de Firestore directamente.
export async function getAuthContext(): Promise<{ uid: string; idToken: string }> {
  const user = await getUser()
  const idToken = await user.getIdToken()
  return { uid: user.uid, idToken }
}
