let freeWorkersMap = new WeakMap();
let capacityMap = new WeakMap();
let concurrencyMap = new WeakMap();
let delayMap = new WeakMap();
let emptyMap= new WeakMap();
let drainMap= new WeakMap();
let runningMap= new WeakMap();
let idleMap= new WeakMap();
let tasksMap= new WeakMap();
let workingWorkersMap= new WeakMap();

class Worker{
    constructor(work, capacity){
    }

}
class Cue{
    constructor(worker, capacity, concurrency, delay, empty, drain){
    }

    get running(){
        return runningMap.get(this);
    }

    get idle(){
        return idleMap.get(this);
    }

    get concurrency(){
        return concurrencyMap.get(this);
    }

    async push(newTasks){
        return new Promise( async resolve =>{
            if((!!newTasks) && (newTasks.constructor === Array)){
                for(let i = 0;i < newTasks.length ;i++)
                {
                    tasksMap.get(this).push(newTasks[i]);
                }
            }else{
                tasksMap.get(this).push(newTasks);
            }
            resolve()
        });
    }

}

function cue(worker,capacity,concurrency,delay = 0){

//TODO
}



module.exports = cue;