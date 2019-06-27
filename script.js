const list = document.querySelector(".container");
let items = [];

const populateItems = () => {
    items = Array.from(list.querySelectorAll(".node"));
}

populateItems();

document.addEventListener("DOMContentLoaded", () => {
    const height = items[0].getBoundingClientRect().height;

    document.addEventListener("mousedown", e => {
        const { srcElement: elem } = e;
        if (elem.classList.contains("node")) {
            state.drag = true;
            state.elem = elem;
            onDragStart(elem, e);
        }
    });

    document.addEventListener("mouseup", e => {
        const { srcElement: elem } = e;

        state.drag = false;
        if (state.elem)
            onDragEnd(state.elem, e);
        state.elem = null;
    });

    document.addEventListener("mousemove", e => {
        if (state.elem)
            onDrag(state.elem, e);
        //setTimeout(() => onDrag(state.elem, e), 0);
    });

    const fillDelta = e => {
        state.end = {
            x: e.clientX,
            y: e.clientY,
        }
        state.delta = {
            x: state.end.x - state.start.x,
            y: state.end.y - state.start.y - state.add * height,
        }
    }

    const checkIfElementsInOrder = () => {
        const pos = Array.from(items).mismatch((a, b) => {
            return a.id > b.id
        });
        const verdict = document.querySelector("#verdict");

        if (pos === -1) {
            verdict.innerHTML = "Initial Order";
        } else {
            verdict.innerHTML = "Not initial Order";
        }
    }
    checkIfElementsInOrder();

    /**
     * 
     * @param {Array} elem 
     */
    const rearrandeElements = (elem) => {
        // // const p = items.indexOf(elem);
        // // const lp = Math.max(0, p - 20);
        // // const rp = Math.min(items.length, p + 20);
        // // const smaller_items = items.slice(lp, rp);

        const oldLogic = () => {
            const pos = Array.from(items).mismatch((a, b) => {
                if (a.classList.contains("changes") || b.classList.contains("changes"))
                    return false;

                const aB = a.getBoundingClientRect();
                const bB = b.getBoundingClientRect();

                return aB.y + aB.height > bB.y + bB.height / 2;
            })

            return pos;
        }

        const newLogic = () => {
            const pos = items.map(item => {
                return !item.classList.contains("changes") ? item.getBoundingClientRect() : null;
            }).mismatch((a, b) => {
                if (a === null || b === null)
                    return false;
                return a.y + a.height > b.y + b.height / 2;
            })

            return pos;
        }

        const res1 = oldLogic();
        const res2 = newLogic();
        const pos = res2;
        // if (res1 === null && res2 === null) {
        //     return null;
        // }
        // if (res1 === null && res2 !== null) {
        //     console.log("WTF", res1, res2);
        //     return null;
        // }
        // if (res1 !== null && res2 === null) {
        //     console.log("WTF2", res1, res2);
        // }
        if (pos === -1) {
            return null;
        }
        else {
            let ret = {};
            if (elem === items[pos])
                ret = {
                    el: items[pos + 1],
                    dir: 1
                }
            else
                ret = {
                    el: items[pos],
                    dir: -1
                }

            list.insertBefore(items[pos + 1], items[pos]);

            populateItems();
            return ret;
        }
    }


    const redoY = (elem, e) => {
        if (elem !== null && e !== null) {
            fillDelta(e);

            elem.style.left = state.delta.x + "px";
            elem.style.top = state.delta.y + "px";
        }
    }
    const onDrag = (elem, e) => {
        redoY(elem, e);

        const changes = rearrandeElements(elem);
        if (changes !== null) {
            checkIfElementsInOrder();

            state.add += changes.dir;

            redoY(elem, e);

            changes.el.style.top = changes.dir * height + "px";
            setTimeout(() => {
                changes.el.classList.add("changes")
                setTimeout(() => {
                    changes.el.style.top = "0px";
                    setTimeout(() => {
                        changes.el.classList.remove("changes")
                    }, 200);
                }, 0);
            }, 0);

        }
    };
    const onDragStart = (elem, e) => {
        state.start = {
            x: e.clientX,
            y: e.clientY,
        }
        state.add = 0;
        elem.classList.add('drag');
        // state.int = setInterval(() => {
        //     onDrag(state.elem, null);
        // }, 20);
    };
    const onDragEnd = (elem, e) => {
        fillDelta(e);

        // rearrandeElements();
        setTimeout(() => {
            elem.classList.remove('drag');
        }, 100);
        // elem.classList.remove('drag');
        elem.classList.add('drop');
        setTimeout(() => {
            elem.classList.remove('drop');
        }, 300);


        elem.style.left = 0;
        elem.style.top = 0;

        // const sortedList = Array.from(items).sort(function (a, b) {
        //     const c = a.id;
        //     const d = b.id;
        //     return c < d ? -1 : c > d ? 1 : 0;
        // });

        // for (let item of sortedList) {
        //     list.appendChild(item);
        // }
        // console.log(state);
    };
});

const state = {};

if (false) {
    Papa.parse("world_cities.csv", {
        download: true,
        complete: function (results) {
            const newElemements = results.data.map((row, i) => {
                const elem = document.createElement("div");
                elem.id = 'm' + i;
                elem.classList.add("node");
                elem.innerText = `${row[0]} ${row[2]} ${row[1]}`;
                return elem;
            })

            list.append(...newElemements);
            populateItems();
        }
    });
}


if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals.");
if (Array.prototype.mismatch)
    console.warn("Overriding existing Array.prototype.mismatch.");

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
}

Array.prototype.mismatch = function (predicate) {
    for (var i = 1, l = this.length; i < l; i++) {
        if (predicate(this[i - 1], this[i]))
            return i - 1;
    }
    return -1;
}


Object.defineProperty(Array.prototype, "equals", { enumerable: false });
Object.defineProperty(Array.prototype, "mismatch", { enumerable: false });
