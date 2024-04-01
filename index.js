import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import {getDatabase, ref, set, update, onValue} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { getAuth, signOut, setPersistence, indexedDBLocalPersistence, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

//getDatabase allows access to the DB, ref determines where you want to look in the DB (and can make a path), set sets the value,
//onValue returns the value and re-returns every time it, or its children, are changed?
//There's also push(), used for adding to a list without the possible overriding of 'set', could be useful?
//Pretty much all this info is from https://www.youtube.com/watch?v=pP7quzFmWBY&ab_channel=Firebase

const firebaseApp = initializeApp({
    apiKey: "AIzaSyBfnd1C_OQbB7ehJcKEs6w3YzbmNIEkxUk",
    authDomain: "kcccapptest.firebaseapp.com",
    databaseURL: "https://kcccapptest-default-rtdb.firebaseio.com",
    projectId: "kcccapptest",
    storageBucket: "kcccapptest.appspot.com",
    messagingSenderId: "642728447440",
    appId: "1:642728447440:web:4b9c17e8c7747d845ebdd5",
    measurementId: "G-8SD4KX1WLZ"
});

const db = getDatabase();

const provider = new GoogleAuthProvider(); //auth stuff
const auth = getAuth();
setPersistence(auth, indexedDBLocalPersistence);

function redirect() {
    signInWithRedirect(auth, provider);
}

var isAdmin = false;
document.getElementById("teamForm").setAttribute("hidden","");
onAuthStateChanged(auth, (user) => {
    if (user) {
        const signIn = document.getElementById("signIn");
        signIn.innerHTML = "Sign Out";
        signIn.removeEventListener("click",redirect);
        signIn.addEventListener("click",signOutAuth);
        if (user.email == "3074517@smsd.org") {
            isAdmin = true;
            document.getElementById("teamForm").removeAttribute("hidden","");
            const addTeamPara = document.createElement("para");
            addTeamPara.setAttribute("id","addTeamPara");
            addTeamPara.innerText = "Add Team/Event Data";
            document.getElementById("body").insertBefore(addTeamPara, document.getElementById("teamForm"));
        }
    } else {
        // User is signed out
    }
  });

function signOutAuth() {
    signOut(auth).then(() => {
        const signIn = document.getElementById("signIn");
        signIn.innerHTML = "Sign In";
        signIn.addEventListener("click",redirect);
        signIn.removeEventListener("click",signOut);
        location.reload();
    }).catch((error) => {
        // An error happened.
    });
}

const teamReference = ref(db, "teams"); //Puts all team info on website
onValue(teamReference, (snapshot) => {
    const element = document.getElementById("div2");
    element.innerHTML = "";
    var i = 1;
    snapshot.forEach((team) => {
        //teamName is shown as a para and given the 'team' class and 'team#' id based on its order
        const teamNamePara = document.createElement("span");
        const arrow = document.createElement('i');
        arrow.setAttribute("class","arrow right");
        arrow.setAttribute("id","team"+i+"Arrow");
        teamNamePara.appendChild(arrow);
        teamNamePara.appendChild(document.createTextNode(" "+team.key + " "));
        teamNamePara.style.fontWeight = "bold";
        teamNamePara.setAttribute("id","team"+i);
        teamNamePara.setAttribute("class","team");
        teamNamePara.addEventListener("click",makeInvis);
        element.appendChild(teamNamePara);

        //teamDiv is created to hold team info and has 'teamDiv' class and 'team#Div' id from parent id
        const teamDiv = document.createElement("div");
        teamDiv.setAttribute("class","teamDiv team"+i);
        teamDiv.setAttribute("id","team"+i+"Div");

        var j = 1; //maybe later, give each event item an ID based on j?
        team.forEach((event) => {
            //eventSpan shows the name of the event and has 'eventName' class
            const eventSpan = document.createElement("span");
            eventSpan.setAttribute("class","eventName");
            eventSpan.appendChild(document.createTextNode(event.key));
            teamDiv.appendChild(eventSpan);
            teamDiv.appendChild(document.createElement("br"));
            teamDiv.appendChild(document.createElement("br"));
            var dataString = "";
            event.forEach((eventData) => {
                dataString += eventData.key + ": "+ eventData.val() + " | ";
            })
            dataString = dataString.substring(0, dataString.length-3);
            //dataSpan shows the info for the event and has 'eventInfo' class
            const dataSpan = document.createElement("span");
            dataSpan.setAttribute("class","eventInfo");
            const dataText = document.createTextNode(dataString);
            dataSpan.appendChild(dataText);
            teamDiv.appendChild(dataSpan);
            teamDiv.appendChild(document.createElement("br"));
            teamDiv.appendChild(document.createElement("br"));
        })
        if (isAdmin) {
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.setAttribute("class","deleteButton team"+i);
            deleteButton.addEventListener("click", function() {
                removeTeam(team);
            });
            element.appendChild(deleteButton);
        }
        var br = document.createElement("br");
        br.setAttribute("class","team"+i);
        element.appendChild(br.cloneNode());
        element.appendChild(br.cloneNode());
        teamDiv.setAttribute("hidden","");
        element.appendChild(teamDiv);
        i++;
    })
});

//Add team (and info) on submit
function addTeamInfo() {
    var teamForm = document.getElementById("teamForm");
    var formData = new FormData(teamForm);
    if (formData.get("userID") == "") {
        return; //Later, display a message?
    }
    var arr = Array.from(formData.values())
    const reference = ref(db, "teams/" + arr[0] + "/" + arr[1]);
    var i = 3;
    while (i < arr.length) {
        const item1 = arr[i];
        const item2 = arr[i+1];
        update(reference, {
            [item1]: item2
        });
        i+=2;
    }
    teamForm.reset();
}

function removeTeam(team) {
    const reference = ref(db, "teams/" + team.key);
    set(reference, null);
}

function addEventField(i) {
    const teamForm = document.getElementById("teamForm");
    const eventDataDiv = document.createElement("div");
    eventDataDiv.setAttribute("id","eventDiv"+i);
    const eventLabel = document.createElement("input");
    eventLabel.setAttribute("autocomplete","off");
    eventLabel.setAttribute("id","event"+i);
    eventLabel.setAttribute("name","event"+i);
    const eventData = document.createElement("input");
    eventData.setAttribute("autocomplete","off");
    eventData.setAttribute("id","event"+i+.5);
    eventData.setAttribute("name","event"+i+.5);
    teamForm.insertBefore(eventDataDiv, document.getElementById("teamSubmit"));
    eventDataDiv.appendChild(eventLabel);
    eventDataDiv.appendChild(eventData);
}

function makeInvis(evt) {
    const div = document.getElementById(evt.currentTarget.getAttribute("id")+"Div");
    if (div.hasAttribute("hidden")) {
        div.removeAttribute("hidden");
    } else {
        div.setAttribute("hidden","");
    }
    const arrow = document.getElementById(evt.currentTarget.getAttribute("id")+"Arrow");
    if (arrow.getAttribute("class").includes("right")) {
        arrow.setAttribute("class","arrow down");
    } else {
        arrow.setAttribute("class","arrow right");
    }
}

document.getElementById("teamSubmit").addEventListener("click",addTeamInfo);

document.getElementById("signIn").addEventListener("click",redirect);

var numFieldsNow = 0;
var searchName = "";
document.addEventListener('click', function(event) {
    var numFields = document.getElementById("numFields");
    if (!numFields.contains(event.target) && numFields.value != numFieldsNow) {
        for (var i = 1; i <= numFieldsNow; i++) {
            document.getElementById("teamForm").removeChild(document.getElementById("eventDiv"+i));
        }
        for (var i = 1; i <= numFields.value; i++)
            addEventField(i);
        numFieldsNow = numFields.value;
    }
    var searchBar = document.getElementById("searchByTeamName");
    if (!searchBar.contains(event.target) && searchBar.value != null) {
        searchName = searchBar.value.toLowerCase();
        var teams = document.getElementsByClassName("team");
        for (var i = 0; i < teams.length; i++) {
            var teamClassElements = document.getElementsByClassName(teams[i].getAttribute("id"));
            if (!teams[i].innerText.toLowerCase().includes(searchName) && !teams[i].hasAttribute("hidden")) {
                teams[i].setAttribute("hidden","");
                document.getElementById(teams[i].getAttribute("id") + "Arrow").setAttribute("class","arrow right");
                for (let x of teamClassElements) {
                    x.setAttribute("hidden","");
                }
            } else if (teams[i].innerText.toLowerCase().includes(searchName) && teams[i].hasAttribute("hidden")) {
                teams[i].removeAttribute("hidden","");
                for (let x of teamClassElements) {
                    if (x.getAttribute("class").includes("deleteButton") || x.tagName == "BR") {
                        x.removeAttribute("hidden","");
                    }
                }
            }
        }
    }
});

//You first input team name, then number of fields, then enter key:value pairs!
//Input for name, input for # fields, then side-by-side key and value inputs

function displayAddForm() {
    for (let form of document.getElementsByTagName("form")) {
        if (form.classList.contains("active")) {
            form.classList.remove("active")
        }
    }
    var formId = document.getElementById("addInfoDropbox").value;
    if (formId != "none") {
        document.getElementById(formId).classList.add("active");
        var numUpper = formId.length - formId.replace(/[A-Z]/g, '').length;
        document.getElementById("addInfoDropbox").style.width = 20 + ((formId.length + numUpper) * 10) + "px";
    } else {
        document.getElementById("addInfoDropbox").style.width = "110px";
    }
    
}

document.getElementById("addInfoDropbox").addEventListener("selectionchange",displayAddForm);
document.getElementById("addInfoDropbox").onchange = displayAddForm;

var text_value = "";
//fetch("test.php")
fetch("http://localhost/CIS560Website/test.php")
.then(y => y.text())
.then(x => document.getElementById("deleteme").innerText = x);
//document.getElementById("deleteme").innerText = text_value;