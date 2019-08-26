const due = require('./due');

function worker (tasks, name) {
    for(let i = 0;i < tasks.length;i++){
        console.log(`Doing task ${tasks[i]}`);
    }
}

//TODO: refactor
// Create a due of 5 workers, // each one processing up to 20 tasks
const workers = due( { empty: () => { console.log("Empty !") }, drain : ()=>{
        console.log("drain !")} , delay : 3000, capacity : 3 , concurrency : 2 }, worker);

// Add a task to be processed by the workers
task = [1, 2, 3, 4, 5, 6,];

workers.push(task).then( op =>{
    console.log("Done");
});


