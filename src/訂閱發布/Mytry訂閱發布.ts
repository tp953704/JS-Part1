class MEventBus{
    private cache:Map<string,any[]>=new Map();
    constructor(){}
    on(type:string,handle:any){
        if(this.cache.has(type)){
            const ahandle  = this.cache.get(type) as any[]
            ahandle.push(handle)
            this.cache.set(type,ahandle)
        }
        this.cache.set(type,[handle])
    }
    emit(type:string,data:any){
        if(this.cache.has(type)){
            const aHandlerFn = this.cache.get(type) as any[]
            aHandlerFn.forEach((handle)=>{
                handle(data)
            })
        }
    }
    off(type:string,handle:any){
        const aHandlerFn = this.cache.get(type)
        this.cache.delete(type)
        
        if(handle && aHandlerFn){
            const aIndex = aHandlerFn.indexOf(handle)
            aHandlerFn.splice(aIndex,1)
            if(aHandlerFn){
                this.cache.set(type,aHandlerFn)
            }
        }
    }
}

const newEventBus = new MEventBus()
const fn = (data:Array<string>)=>{
    console.log(data)
}
newEventBus.on('btn:click',fn)

newEventBus.emit('btn:click',['1','2','3'])

newEventBus.off('btn:click',fn)
newEventBus.emit('btn:click',['1','2','3221'])