# olum-helpers

olum helpers are methods for boosting your developemnt process

<p align="center">
 <a href="https://www.npmjs.com/package/olum-helpers" target="_blank"><img src="https://img.shields.io/npm/v/olum-helpers" alt="npm"></a>
 <img src="https://img.shields.io/npm/dm/olum-helpers" alt="npm">
 <img src="https://img.shields.io/npm/l/olum-helpers" alt="npm">
</p>

# Documentation

### CDN

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Olum Helpers</title>
  </head>

  <body>
    <main>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Exercitationem reprehenderit rerum ad cumque magnam. Quisquam earum laborum quia
      cumque ex. Excepturi eos accusantium fugit illo sit tempora dolorem odio cupiditate.
    </main>
    <button>toggle</button>

    <li>
      <a href="#" tolang="en">en</a>
    </li>
    <li>
      <a href="#" tolang="ar">ar</a>
    </li>
    <script src="https://unpkg.com/olum-helpers@latest/dist/olum-helpers.min.js"></script>
    <script>
      // selector & debug
      const main = $("main");
      debug(main);
      debug(main, "warn");
      debug(main, "err");
      debug(main, "error");

      // origin
      new Origin().get("https://jsonplaceholder.typicode.com/todos/1").then(debug).catch(debug);

      // set template
      const temp = setTemp("<div>{{name}}</div>", {
        name: "jesus",
      });
      debug(temp);

      // trans
      let en = {
        olum: "olumjs",
      };
      let ar = {
        olum: "اولوم",
      };
      new Localize(
        {
          en,
          ar,
        },
        ["ar"]
      );
      console.log("olum".trans());

      // service - OOP
      // class API extends Service {
      //   constructor() {
      //     super("ApiDataLoaded");
      //   }
      //   todos = [];
      //   add(todo) {
      //     this.todos.push(todo);
      //     this.trigger();
      //   }
      //   get() {
      //     return this.todos;
      //   }
      // }
      // const api = new API();

      // // listen to changes
      // window.on(api.event, () => {
      //   const todos = api.get();
      //   console.warn(todos);
      // });

      // // fire changes
      // api.add({
      //   todo: "take out the trash",
      //   id: 100
      // });

      // service - plain object
      const service = new Service("ApiDataLoaded");
      const api = {
        event: service.event,
        todos: [],
        add(todo) {
          this.todos.push(todo);
          service.trigger();
        },
        get() {
          return this.todos;
        },
      };

      // listen to changes
      window.on(api.event, () => {
        const todos = api.get();
        console.warn(todos);
      });

      // fire changes
      api.add({
        todo: "take out the trash",
        id: 100,
      });

      // string
      debug("simple text".cap());
      debug("SIMPLE TEXT".lower());
      debug("simple text".upper());

      // toggle
      const btn = $("button");
      btn.on("click", () => main.toggle());
    </script>
  </body>
</html>
```

### ES6 Module

```javascript
import { $, debug, setTemp, Service, Origin, Localize } from "olum-helpers";

// selector & debug
const main = $("main");
debug(main);
debug(main, "warn");
debug(main, "err");
debug(main, "error");

// origin
new Origin().get("https://jsonplaceholder.typicode.com/todos/1").then(debug).catch(debug);

// set template
const temp = setTemp("<div>{{name}}</div>", {
  name: "jesus",
});
debug(temp);

// trans
let en = {
  olum: "olumjs",
};
let ar = {
  olum: "اولوم",
};
new Localize(
  {
    en,
    ar,
  },
  ["ar"]
);
console.log("olum".trans());

// service - OOP
class API extends Service {
  constructor() {
    super("ApiDataLoaded");
  }
  todos = [];
  add(todo) {
    this.todos.push(todo);
    this.trigger();
  }
  get() {
    return this.todos;
  }
}
const api = new API();

// listen to changes
window.on(api.event, () => {
  const todos = api.get();
  console.warn(todos);
});

// fire changes
api.add({
  todo: "take out the trash",
  id: 100,
});

// string
debug("simple text".cap());
debug("SIMPLE TEXT".lower());
debug("simple text".upper());

// toggle
const btn = $("button");
btn.on("click", () => main.toggle());
```
