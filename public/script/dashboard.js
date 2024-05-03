let descriptionIsPlain = true;

// Colors for homeworkElement
const homeworkElementCheckedColor = '#3CB371';
const homeworkElementNotCheckedColor =  '#5acbd4';

document.addEventListener('DOMContentLoaded', () => {
    loadUserdata().then(userdata => {
        insertUserProfile(userdata);
        insertUserGrades(userdata);
        insertUserHomework(userdata);
        setupLogOutBtn();
        setupChangeGradesForm(userdata);
        setupAddHomeworkForm();
        setupAddSubjectWindow(userdata);
    });
});

// get userdata from server
async function loadUserdata() {
    const res = await fetch('http://localhost:8080/dashboard/userdata');
    const userdata = await res.json();
    return userdata;
}
// insert profile data from loaded userdata
function insertUserProfile(userdata) {
    document.getElementById('usernameSpan').innerHTML = `<strong>Username: </strong>${userdata.username}`;
    document.getElementById('emailSpan').innerHTML = `<strong>Email: </strong>${userdata.email}`;
}
// insert grades from loaded userdata
function insertUserGrades(userdata) {
    
    const gradesDiv = document.getElementById('gradesDiv');
    
    const userGrades = JSON.parse(userdata.grades);
    const userGpa = calculateStudentGpa(userGrades)
    const subjects = Object.keys(userGrades);

    // display subjects with grades and gpa
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        const grades = userGrades[subject];

        const newGradesDivElement = document.createElement('span');
        newGradesDivElement.id = i;
        newGradesDivElement.innerHTML = `<strong>${subject}: </strong>${grades.join(', ')} | ${userGpa[subject].toFixed(1)}`;
        gradesDiv.appendChild(newGradesDivElement);
    
    }
    
    // display overall averrage
    const averrageElement = document.createElement('span');    
    if (!isNaN(userGpa['Averrage'])) {
        averrageElement.innerHTML = `<strong>Averrage: </strong> ${(userGpa['Averrage']).toFixed(1)}`;
        gradesDiv.appendChild(averrageElement);
    }
}

// calculate gpa for grades in student
function calculateStudentGpa(userGrades) {
    let subjectsWithGpa = {};
    let totalGradesInGrades = 0;
    let sumOfAllGrades = 0

    for (let subject in userGrades) {

        let totalGradesInSubject = 0;
        let sumOfGradesInSubject = 0

        for(let grade of userGrades[subject]) {
            totalGradesInGrades++;
            totalGradesInSubject++;

            sumOfAllGrades += grade;
            sumOfGradesInSubject += grade;
        }

        const subjectGpa = sumOfGradesInSubject / totalGradesInSubject;
        
        subjectsWithGpa[subject] = subjectGpa;
    }

    const overallGpa = sumOfAllGrades / totalGradesInGrades;

    subjectsWithGpa['Averrage'] = overallGpa;

    return subjectsWithGpa;
}

// insert homework from loaded userdata
function insertUserHomework(userdata) {
    const homeworkDiv = document.getElementById('homeworkDiv')
    for (let homework of userdata.homework) {
        const homeworkElement = document.createElement('div');
        const homeworkElementSubject = document.createElement('label')
        const homeworkElementDescription = document.createElement('span');
        const homeworkElementLastRow = document.createElement('div');
        const homeworkElementCheckbox = document.createElement('input');
        const homeworkElementDelete = document.createElement('input');

        if(homework.done) {
            homeworkElementCheckbox.checked = true;
            homeworkElement.style.backgroundColor = homeworkElementCheckedColor;
        }
        else {
            homeworkElementCheckbox.checked = false;
            homeworkElement.style.backgroundColor = homeworkElementNotCheckedColor;
        }

        homeworkElement.id = homework._id;
        homeworkElement.classList.add('homeworkElement');
            
        homeworkElementSubject.innerHTML = `<strong>${homework.subject}:</strong>`;

        if(homework.descriptionIsPlain) {
            homeworkElementDescription.textContent = homework.description;
        } else {
            homeworkElementDescription.innerHTML = homework.description;
        }    
            
        homeworkElementLastRow.style.display = 'flex';
        homeworkElementLastRow.style.justifyContent = 'flex-end'
        homeworkElementCheckbox.type = 'checkBox';
        homeworkElementCheckbox.style.alignSelf = 'flex-end';
        homeworkElementCheckbox.classList.add('checkbox')

        homeworkElementCheckbox.addEventListener('change', event => {
            if (event.target.checked) {
                homeworkElement.style.backgroundColor = homeworkElementCheckedColor;
            } else {
                homeworkElement.style.backgroundColor = homeworkElementNotCheckedColor;
            }
            submitHomeworkElementChanges(event.target.checked, homeworkElement.id);
        });

        homeworkElementDelete.type = 'submit';
        homeworkElementDelete.classList.add('button1');
        homeworkElementDelete.value = 'Delete';
        homeworkElementDelete.addEventListener('click', event => {
            event.preventDefault();
            deleteHomeworkElement(homeworkElement.id);
        });

        homeworkElementLastRow.appendChild(homeworkElementCheckbox);
        homeworkElementLastRow.appendChild(homeworkElementDelete);

        homeworkElement.appendChild(homeworkElementSubject);
        homeworkElement.appendChild(homeworkElementDescription);
        homeworkElement.appendChild(homeworkElementLastRow)
        homeworkDiv.appendChild(homeworkElement);
    }
}

// setup events for addGradeskForm
function setupChangeGradesForm(userdata) {
    const gradesSubjectDropdownButton = document.getElementById('gradesSubjectDropdownButton');
    const gradesSubjectDropdownContent = document.getElementById('gradesSubjectDropdownContent');
    const openWindowBtn = document.getElementById('openWindowBtn');
    const gradesInput = document.getElementById('gradesInput');
    const addBtn = document.getElementById('addBtn');
    const setBtn = document.getElementById('setBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    gradesSubjectDropdownButton.addEventListener('click', event => {
        event.preventDefault();
    });

    const userSubjects = JSON.parse(userdata.subjects);
    console.log(userSubjects);
    
    for(subject of userSubjects) {
        const dropdownGradeElement = document.createElement('p');
        dropdownGradeElement.textContent = subject;

        dropdownGradeElement.addEventListener('click', event => {
            event.preventDefault();
            gradesSubjectDropdownButton.textContent = event.target.textContent;
        });

        gradesSubjectDropdownContent.appendChild(dropdownGradeElement);
    }

    openWindowBtn.addEventListener('click', event => {
        event.preventDefault();
        document.getElementById('addSubjectWindow').style.display = 'flex';
    });

    gradesInput.addEventListener('keydown', event => {
        if(event.keyCode === 13) {
            event.preventDefault();
            submitChangeGradesForm('add');
        }     
    })
    addBtn.addEventListener('click', event => {
        event.preventDefault();
        submitChangeGradesForm('add');
    })
    setBtn.addEventListener('click', event => {
        event.preventDefault();
        submitChangeGradesForm('set');
    })
    deleteBtn.addEventListener('click', event => {
        event.preventDefault();
        submitChangeGradesForm('delete');
    });
}

// setup events for addHomeworkForm
function setupAddHomeworkForm() {
    const addHomeworkForm = document.getElementById('addHomeworkForm');
    const subjectInput = document.getElementById('subjectInputHomework');
    const descriptionInput = document.getElementById('descriptionInput');
    const homeworkSubmitBtn = document.getElementById('homeworkSubmitBtn');
    const homeworkSwitchHTMLBtn = document.getElementById('homeworkSwitchHTMLBtn')
    homeworkSwitchHTMLBtn.style.backgroundColor = '#E2E2E2';

    subjectInput.addEventListener('keydown', event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            descriptionInput.focus();
        }
    });

    descriptionInput.addEventListener('keydown', event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            submitAddHomeworkForm();
        }
    });

    homeworkSubmitBtn.addEventListener('click', event => {
        event.preventDefault();
        submitAddHomeworkForm();
    })
    homeworkSwitchHTMLBtn.addEventListener('click', event => {
        if (homeworkSwitchHTMLBtn.style.backgroundColor != 'rgb(144, 241, 117)') {
            descriptionIsPlain = false;
            homeworkSwitchHTMLBtn.style.backgroundColor = 'rgb(144, 241, 117)';
        } else {
            descriptionIsPlain = true;
            homeworkSwitchHTMLBtn.style.backgroundColor = '#E2E2E2';
        }
    });
}

// send changes grades changes to server
function submitChangeGradesForm(operator) {
    const data = {
        subject: document.getElementById('gradesSubjectDropdownButton').textContent,
        grades: document.getElementById('gradesInput').value,
        operator: operator
    }
    fetch('http://localhost:8080/dashboard/changeGrades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json()
    })
    .then(data => {
        if (data.redirect) window.location.href = data.redirectTo;
    })
    .catch(err => {
        console.error(err);
        document.getElementById('gradesErrHandeler').textContent = err.toString().split(':')[1];
        document.getElementById('gradesErrHandeler').style.display = 'flex';
    });
}

// send new homework to server
function submitAddHomeworkForm() {
    const data = {
        subject: document.getElementById('subjectInputHomework').value,
        description: document.getElementById('descriptionInput').value,
        descriptionIsPlain: descriptionIsPlain
    }
    fetch('http://localhost:8080/dashboard/addHomework', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json();
    })
    .then(data => {
        document.getElementById('homeworkErrHandeler').style.display = 'none';
        if(data.redirect) window.location.href = data.redirectTo;
    })
    .catch(err => {
        document.getElementById('homeworkErrHandeler').textContent = err.toString().split(':')[1];
        document.getElementById('homeworkErrHandeler').style.display = 'flex';
        console.error(err);
    });
}

// send homeworkElement changes to server
function submitHomeworkElementChanges(checked, id) {
    const data = {
        checked: checked,
        id: id,
    };

    fetch('http://localhost:8080/dashboard/homeworkChanges', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json();
    })
    .then(data => {
        if(data.redirect) window.location.href = data.redirectTo;
    })
    .catch(err => {
        console.error(err);
        
    });
}  
// delete Homework element in the html and the homework in the database
function deleteHomeworkElement(elementId) {
    const homeworkElement = document.getElementById(elementId);
    
    const data = {
        elementId: elementId
    }
    fetch('http://localhost:8080/dashboard/deleteHomeworkElement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json();
    })
    .then(data => {
        if (data.redirect) window.location.href = data.redirectTo;
        else {
            const parentElement = homeworkElement.parentElement
            // making the delete-process visible to the user
            homeworkElement.style.backgroundColor = 'rgb(255, 129, 129)';
            setTimeout(() => {
                parentElement.removeChild(homeworkElement);
            }, 600);
        }
    })
    .catch(err => {
        console.error(err);
    });
}   
// setting up the log out button
function setupLogOutBtn() {
    document.getElementById('logOutBtn').addEventListener('click', event => {
        fetch('http://localhost:8080/dashboard/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                logout: true
            }),
        })
        .then(res => {
            if (!res.ok) return res.json().then(err => {
                throw new Error(err.err);
            })
            return res.json();
        })
        .then(data => {
            if(data.redirect) window.location.href = data.redirectTo;
        })
        .catch(err => {
            console.error(err)
            alert(err);
        });
    });
}

function setupAddSubjectWindow(userdata) {
    const addSubjectWindow = document.getElementById('addSubjectWindow');
    const exitBtn = document.getElementById('exitBtn');
    const addSubjectInput = document.getElementById('addSubjectInput');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const deleteSubjectBtn = document.getElementById('deleteSubjectBtn');
    const subjectList = document.getElementById('subjectList');

    exitBtn.addEventListener('click', event => {
        event.preventDefault();
        addSubjectWindow.style.display = 'none';
    });

    addSubjectInput.addEventListener('keydown', event => {
        if(event.keyCode === 13) {
            event.preventDefault();
            submitSubjectChange('add');
        }
    })

    addSubjectBtn.addEventListener('click', event => {
            event.preventDefault();
            submitSubjectChange('add');
    });

    deleteSubjectBtn.addEventListener('click', event => {
        event.preventDefault();
        submitSubjectChange('delete');
    });

    for(subject of JSON.parse(userdata.subjects)) {
        const listElement = document.createElement('li');
        listElement.textContent = subject;
        subjectList.appendChild(listElement);
    }
}

function submitSubjectChange(operator) {
    console.log(document.getElementById('addSubjectInput').value);
    const data = {
        subject: document.getElementById('addSubjectInput').value,
        operator: operator
    }

    fetch('http://localhost:8080/dashboard/addSubject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if(!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json();
    })
    .then(data => {
        if(data.redirect) window.location.href = data.redirectTo;
    })
    .catch(err => {
        console.error(err);
    });
}