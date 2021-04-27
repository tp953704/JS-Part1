import {dirname,extname,resolve} from 'path';
import {readFileSync,existsSync} from 'fs';
import {runInThisContext} from 'vm';

export class MyModule{
    private id:string;
    private path:string;
    public exports:any;
    private filename:string|null;
    private loaded:boolean;

    constructor(id:string){
        this.id = id;
        this.path = dirname(id)
        this.exports = {};        // 倒出的東西，空對象
        this.filename = null;     // 模塊文建名
        this.loaded = false;      // loaded用来標示使否加載
    }
    static cache = Object.create(null)
    
    // 擴充名稱與擴充方法
    // static extensions:any['.js'] = function(module:MyModule,filename:string){
    //     const content = readFileSync(filename, 'utf8');
    //     module.compiler(content, filename);
    // }
    static extensions={
        '.js':function(module:MyModule,filename:string){
            const content = readFileSync(filename, 'utf8');
            module.compiler(content, filename);
        },
        '.json':function (module:MyModule, filename:string) {
            const content = readFileSync(filename, 'utf8');
            module.exports = JSON.parse(content);
        }
    } 
   
    // 加載
    static load(request:string){
        // 當前的路徑
        const filename = MyModule.resolveFilename(request)
        // 檢查緩存
        const fileCache = MyModule.cache[filename]  
        if(fileCache){
            return fileCache.exports;
        }
        // 如果緩存存在
        // 檢查模塊式加載過，加載過 exports
        const ModuleItem = new MyModule(filename);
        // 如果不在緩存中 new 一個module實例
        MyModule.cache[filename] = ModuleItem;
        ModuleItem.loading(filename)
        return ModuleItem.exports;
    }
    // 解析真實路徑
    static resolveFilename(request:string):string{
        const filename = resolve(__dirname,request);   // 絕對路徑
        const ext = extname(request);    //文件路徑
        
        // .js OR .JSON
        if (!ext) {
            const exts = Object.keys(MyModule.extensions);
            for (let i = 0; i < exts.length; i++) {
                const currentPath = `${filename}${exts[i]}`;
            
                // 如果拼接后的文件存在，返回拼接的路徑
                if (existsSync(currentPath)) {
                    return currentPath;
                }
            }
        }
          
        return request;
    }

    // wrap
    static wrap(content:string){
        const wrapArray = [
            '(function (exports, require, module, __filename, __dirname) {',
            '\n});'
        ]
        return wrapArray[0]+content+wrapArray[1]
    }
    // 下載
    require(id:string){
        // 做檢查

        // 檢查完
        return MyModule.load(id);
    }
    // 真正加載
    loading(filename:string){
        // 結尾名 ex: .js
        const extraName:string = extname(filename) as string
        // 處理檔案
        (MyModule.extensions as any)[extraName](this,filename)
        this.loaded = true;
    }
    // 編譯
    compiler(content:string, filename:string){
        const wrapper = MyModule.wrap(content);
        // vm虛擬沙盒
        // 返回值是轉換後的函數，compiledWrapper是一个函數
        const compiledWrapper = runInThisContext(wrapper,{
            filename:filename,
            lineOffset: 0,
        })
        // 準備執行compiedWrapper
        // exports, require, module, __filename, __dirname
        const dir = dirname(filename);
        // 把compiledWrapper的this指向自己的模塊
        compiledWrapper.call(this.exports,this.exports,this.require,this,filename,dir)
    }
}


