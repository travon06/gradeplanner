const { Router } = require('express');
const router = Router();
const path = require('path');
const User = require('../database/Schemas/User');
const Homework = require('../database/Schemas/Homework');

router.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../clients/dashboard.html'));
});

router.get('/userdata', async (req, res) => {
    const { _id } = req.session.user
    const UserDb = await User.findOne( {_id: _id })
    const homework = await Homework.find({user: req.session.user._id});
    res.status(200).json({ email: UserDb.email, username: UserDb.username, grades: UserDb.grades, homework: homework });
}) ;

router.post('/changeGrades', async (req, res) => {
    const { subject, grades, operator } = req.body;
    console.log(req.body);

    if(!subject) return res.status(400).json({ err: 'Subject is missing'});
    if(operator != 'delete' && !grades) return res.status(400).json({err: 'You need grades if you do not delete'})

    // formating grades and filtering if grade is NaN
    let gradeList = grades.trim().split(',').map(grade => parseInt(grade)).filter(grade => !isNaN(grade));

    const UserDb = await User.findOne({username: req.session.user.username});
    let UserGrades = JSON.parse(UserDb.grades) || {};

    switch(operator) {
        case 'add':
            if(!UserGrades.hasOwnProperty(subject)) {
                UserGrades[subject] = [];
            }
            UserGrades[subject].push(...gradeList);
            break;
        case 'set':
            UserGrades[subject] = gradeList;
            break;
        case 'delete':
            if(grades == '') {
                delete UserGrades[subject];
            } else if (UserGrades.hasOwnProperty(subject)) {
                for (let gradeToRemove of gradeList) {
                    const index = UserGrades[subject].indexOf(gradeToRemove);
                    if (index !== -1) {
                        UserGrades[subject].splice(index, 1);
                    }
                }
            }
            break;

    }


   await UserDb.updateOne({ $set: {grades: JSON.stringify(UserGrades)}});

   const updatedUser = await User.findOne({username: req.session.user.username});

   req.session.user = updatedUser;

    res.status(200).json({ redirect: true, redirectTo: '/dashboard' });
});

router.post('/addHomework', async (req, res) => {
    const { subject, description } = req.body;
    const UserId = req.session.user._id;

    if(!subject || !description) return res.status(400).json({err: 'One or two arguments are missing'});

    const test = await Homework.create({ subject: subject, description: description, user: UserId });
    console.log(test);

    return res.status(200).json({ redirect: true, redirectTo: '/dashboard' });

});

router.post('/homeworkChanges', async (req, res) => {
    const { checked, id } = req.body;
    console.log(req.body);
    await Homework.findByIdAndUpdate(id, { $set: { done: checked }});
    res.status(200).json({ redirect: false });
});

router.post('/deleteHomeworkElement', async (req, res) => {
    const { elementId } = req.body;

    await Homework.findByIdAndDelete({ _id: elementId });

    res.status(200).json({ redirect: false });
});


router.post('/logout', (req, res) => {
    const { logout } = req.body;

    if(!logout) return res.status(400).json({ err: 'something went wrong'});

    req.session.user = null;

    return res.status(200).json({ redirect: true, redirectTo: '/auth/login' });
});

module.exports = router;
