



namespace A{
    // 不兼容 IE 
  
    function bind1(this:any,newThis:any,...arg1:any){
       
        const fn = this;
        return function(...arg2:any){
            return fn.apply(newThis,...arg1,...arg2)
        }
    }
    //  不兼容new
    // 複雜 討人厭
   function bind2(this:any,asThis:any){
        const slice = Array.prototype.slice;
        const args = slice.call(arguments,1)
        const fn = this;
        if(typeof fn !== "function"){
            throw new Error("cannot bind non_function");
        }
        return function(){
            const arg2 = slice.call(arguments,0)
            return fn.apply(asThis,args.concat(arg2))
        }
   }

    function fn(a:number, b:number, c:number) {
        return a + b + c;
    }
  
    fn.bind1=bind1;
    // Function.prototype.bind1 = bind1;
    // Function.prototype.bind2 = bind2;

    const _fn = fn.bind1(null, 10);
    const ans = _fn(20, 30); // 60
    console.log(ans)

    class Person{
        constructor(private name:string,private age:number){
            this.name = name;
            this.age = age;
        }
        static bind1=bind1
    }
    Person.bind1=bind1;
    const person:any = Person.bind1({})
    const p = new person('name',18)
    console.log(p)
}


