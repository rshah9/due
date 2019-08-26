//TODO: refactor
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
        this.worker = work;
        this.capacity = capacity;
        this.working = false;
        this.waiting = false;
    }

    async work(tasks){
        await this.worker(tasks);
    }

}
class Due{
    constructor(worker, capacity, concurrency, delay, empty, drain){
        this.worker = worker;
        capacityMap.set(this,capacity);
        concurrencyMap.set(this,concurrency);
        delayMap.set(this,delay);
        emptyMap.set(this,empty);
        drainMap.set(this,drain);
        runningMap.set(this,false);
        idleMap.set(this,true);
        tasksMap.set(this,[]);
        workingWorkersMap.set(this,0);

        let workers = [];
        for(let i = 0;i< concurrencyMap.get(this);i++){
            workers.push(new Worker(this.worker,capacityMap.get(this)));
        }

        freeWorkersMap.set(this,workers);

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

    get length(){
        return tasksMap.get(this);
    }

    set concurrency(concurrency){
        concurrencyMap.set(this,concurrency);
        let workers = [];
        for(let i = 0;i< concurrencyMap.get(this);i++){
            workers.push(new Worker(this.worker,capacityMap.get(this)));
        }

        freeWorkersMap.set(this,workers);
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

            if(tasksMap.get(this).length < capacityMap.get(this)){
                this.waiting = true;
                const sleep = m => new Promise(r => { this.waitingLoop = setTimeout(r, m)});

                await sleep(delayMap.get(this));

                if(this.waiting = true){
                    this.waiting = false;
                    await this.startWorking();
                }
            }else{
                if(this.waiting === true){
                    this.waiting = false;
                    clearTimeout(this.waitingLoop);
                }
                await this.startWorking();
            }

            drainMap.get(this)();
            resolve()
        });
    }

    async startWorking(){
        new Promise(async resolve =>{
            runningMap.set(this,true);
            idleMap.set(this,false);
            await this.offerWork();
            resolve()
        })
    }

    async offerWork(){
        new Promise(async resolve => {
            if(tasksMap.get(this).length === 0){
                runningMap.set(this,false);
                idleMap.set(this,true)
            }else{
                //TODO: refactor
                while(freeWorkersMap.get(this).length > 0 && tasksMap.get(this).length > 0){
                    if(workingWorkersMap.get(this) !== concurrencyMap.get(this)){
                        workingWorkersMap.set(this,workingWorkersMap.get(this)+1);
                        let freeWorker =  freeWorkersMap.get(this).pop();
                        let doneWorker = await this.workerStart(freeWorker);
                        workingWorkersMap.set(this,workingWorkersMap.get(this)-1);
                        if(freeWorkersMap.get(this) + 1 <= concurrencyMap.get(this)) freeWorkersMap.get(this).unshift(doneWorker);
                        await this.offerWork()
                    }
                }
            }
            resolve()
        })
    }

    async workerStart(worker){
        new Promise(async resolve =>{
            let toDoTasks = tasksMap.get(this).splice(0,capacityMap.get(this));
            if(tasksMap.get(this).length === 0) emptyMap.get(this)();
            await worker.work(toDoTasks);
            return worker
        });
    }
}

function due(worker,capacity,concurrency = 1, delay = 0){
    //TODO: refactor
    if((typeof(worker) === "object" || typeof(capacity) === "object") && worker !== undefined && capacity !== undefined){
        let workerNumber = typeof(worker) === "object" ? capacity : worker;
        let options = typeof(capacity) === "object" ? capacity : worker;
        capacity = options.capacity || 1;
        concurrency = options.concurrency || 1;
        delay = options.delay || 1;
        let emptyFunc = () => {};
        let empty = options.empty || emptyFunc;
        let drain = options.drain || emptyFunc;
        return new Due(workerNumber,capacity,concurrency,delay,empty,drain)
    }else if(worker !== undefined && capacity !== undefined){
        return new Due(worker,capacity,concurrency,delay,()=>{},()=>{})
    }
    throw Error("Input Mismatch");
}


module.exports = due;