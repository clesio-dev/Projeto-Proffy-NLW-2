const {subjects, weekdays, getSubject, convertHoursToMinutes} = require("./utils/format")
const {queryPageStudy, queryPageStudyCreate} = require("./database/selectQuery")
const database = require("./database/db")

function pageLanding(req,res){
    return res.render("index.html")
}
async function pageStudy(req,res){
    const filters = req.query
    
    if(!filters.weekday || !filters.subject || !filters.time){
        const query = queryPageStudy()
        const db = await database
        const proffys = await db.all(query)
        proffys.map((proffys)=>{
            proffys.subject = getSubject(proffys.subject)
        })
        return res.render("study.html", {filters, subjects, weekdays, proffys})
    }
    
    const timeToMinutes = convertHoursToMinutes(filters.time)
    const query = queryPageStudyCreate(filters, timeToMinutes)

    try{
        const db = await database
        const proffys = await db.all(query)
        
        proffys.map((proffy)=>{
            proffy.subject = getSubject(proffy.subject)
        })
        
        return res.render("study.html", {filters, subjects, weekdays, proffys})
    }catch(error){
        console.log(error)
    }    
}
function pageGiveClasses(req, res){
    return res.render("give-classes.html", {subjects, weekdays})
}


async function saveClasses(req, res){
    const createProffy = require("./database/createProffy")
    const db = await database

    const proffyValue = {
        name:req.body.name,
        avatar:req.body.avatar,
        whatsapp:req.body.whatsapp,
        bio:req.body.bio
    }
    const classValue = { 
        subject:req.body.subject,
        cost:req.body.cost
    }
    const classScheduleValue = req.body.weekday.map((weekday, index)=>{
        return {
            weekday,
            time_from:convertHoursToMinutes(req.body.time_from[index]),
            time_to:convertHoursToMinutes(req.body.time_to[index])
        }
    })

    try{
        await createProffy(db, {proffyValue, classValue, classScheduleValue})
       
        let queryString = "?subject="+req.body.subject
        queryString += "&weekday="+req.body.weekday[0]
        queryString += "&time="+req.body.time_from[0]

        return res.render("page-success.html", {queryString})

    }catch(error){
        console.log(error)
    }
}


module.exports = {
    pageLanding,
    pageStudy,
    pageGiveClasses,
    saveClasses
}