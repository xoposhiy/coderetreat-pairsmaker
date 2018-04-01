import firebase from 'firebase'

export default function auth(){
  if (!firebase.auth().currentUser){
    const provider = new firebase.auth.GoogleAuthProvider()
    return firebase.auth().signInWithPopup(provider).then(result => result.user);
  }
  return Promise.resolve(firebase.auth().currentUser)
}
