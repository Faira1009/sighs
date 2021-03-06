import "./App.css";
import Home from "./Components/Home";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebase from "./config/firebase.config";
import React, { Component } from "react";
import Login from "./Components/Login";
import Slogan from "./Components/Slogan";
import SignUp from "./Components/SignUp";
export const db = firebase.firestore();
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      loginState: false,
      signupState: false,
      home: [],
      sloganState: true,
      logout: true,
    };
    this.toggleLoginForm = this.toggleLoginForm.bind(this);
    this.toggleSignUpForm = this.toggleSignUpForm.bind(this);
    this.login = this.login.bind(this);
    this.collectInfor = this.collectInfor.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
  }
  componentDidMount() {
    if (window.localStorage.getItem("user")) {
      this.setState({ logout: false });
    } else {
      this.setState({ logout: true });
    }
  }
  toggleLoginForm() {
    this.setState({ loginState: !this.state.loginState });
  }
  toggleSignUpForm() {
    this.setState({ signupState: !this.state.signupState });
  }
  collectInfor(e) {
    e.preventDefault();
    let value = e.target.value;
    this.setState({ [e.target.name]: value });
  }
  responseFacebook(response) {
    const obj = this;
    obj.setState({ email: response.email });
    if (response.status !== "unknown") {
      db.collection("users")
        .where("Email", "==", response.email)
        .get()
        .then(function (querySnapshot) {
          return querySnapshot.empty;
        })
        .then((res) => {
          if (res) {
            db.collection("users")
              .add({
                Email: response.email,
                Username: response.userID,
                Password: response.id,
                Fullname: response.name,
                Avatar: response.picture.data.url,
              })
              .then(function (docRef) {
                return docRef
                  .update({
                    ID: docRef.id,
                  })
                  .then(() => {
                    obj.setState({ id: docRef.id });
                  });
              })
              .then(() => {
                db.collection("users")
                  .where("ID", "!=", obj.state.id)
                  .get()
                  .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                      let data = doc.data();
                      db.collection("chatrooms")
                        .add({
                          user1: data.ID,
                          user2: obj.state.id,
                          message: [],
                          modifiedDate: new Date(),
                        })
                        .then(function (docRef) {
                          docRef.update({
                            ID: docRef.id,
                          });
                        })
                        .then(() => {
                          obj.loginWithFB();
                        });
                    });
                  });
              });
          } else {
            obj.loginWithFB();
          }
        });
    }
  }
  loginWithFB() {
    let obj = this;
    let home = [];
    db.collection("users")
      .where("Email", "==", obj.state.email)
      .get()
      .then(function (querySnapshot) {
        if (!querySnapshot.empty) {
          let data = querySnapshot.docs[0].data();
          const owner = {
            username: data.Username,
            ID: data.ID,
          };
          window.localStorage.setItem("user", JSON.stringify(owner));
          window.localStorage.setItem("data", JSON.stringify(data));
          home.push(<Home data={data} />);
          obj.setState({
            home: home,
            loginState: false,
            sloganState: false,
            signupState: false,
          });
        }
      });
  }
  login(e) {
    let obj = this;
    let home = [];
    e.preventDefault();
    db.collection("users")
      .where("Username", "==", obj.state.username)
      .where("Password", "==", obj.state.password)
      .get()
      .then(function (querySnapshot) {
        if (!querySnapshot.empty) {
          let data = querySnapshot.docs[0].data();
          window.localStorage.setItem("data", JSON.stringify(data));
          const owner = {
            username: data.Username,
            ID: data.ID,
          };
          window.localStorage.setItem("user", JSON.stringify(owner));
          home.push(<Home data={data} />);
          obj.setState({
            home: home,
            loginState: false,
            sloganState: false,
            signupState: false,
          });
        } else {
          alert("Invalid username or password!");
        }
      });
  }
  render() {
    let homePage;
    this.state.logout
      ? (homePage = (
          <>
            <Slogan
              className={this.state.sloganState ? "" : "none"}
              onLogin={this.toggleLoginForm}
              onSignup={this.toggleSignUpForm}
            />
            <Login
              onInput={this.collectInfor}
              onLogin={this.login}
              move={() => {
                this.toggleLoginForm();
                this.toggleSignUpForm();
              }}
              onFB={this.responseFacebook}
              onExit={this.toggleLoginForm}
              status={
                this.state.loginState
                  ? "form__container"
                  : "form__container none"
              }
              auth={this.state.auth}
            />
            <SignUp
              move={() => {
                this.toggleLoginForm();
                this.toggleSignUpForm();
              }}
              onExit={this.toggleSignUpForm}
              status={
                this.state.signupState
                  ? "form__container"
                  : "form__container none"
              }
            />
            {this.state.home}
          </>
        ))
      : (homePage = (
          <>
            <Home data={JSON.parse(window.localStorage.getItem("data"))} />
          </>
        ));
    return <div className="container">{homePage}</div>;
  }
}

export default App;
