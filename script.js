document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".container");
    let items = list.querySelectorAll(".node");
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

    const rearrandeElements = (elem) => {
        // const sortedList = Array.from(items).sort((a, b) => {
        //     const a_y = a.getBoundingClientRect().y;
        //     const b_y = b.getBoundingClientRect().y;
        //     return a_y < b_y ? -1 : a_y > b_y ? 1 : 0;
        // });

        const pos = Array.from(items).mismatch((a, b) => {
            if (a.classList.contains("changes") || b.classList.contains("changes"))
                return false;

            const aB = a.getBoundingClientRect();
            const bB = b.getBoundingClientRect();

            return aB.y + aB.height > bB.y + bB.height / 2;
        })

        // console.log(pos);

        if (pos === -1) {
            return null;
        }
        else {
            // let elem1, elem2;
            // if (elem === items[pos]) {
            //     elem1 = items[pos];
            //     elem2 = items[pos + 1];
            // } else {
            //     elem1 = items[pos];
            //     elem2 = items[pos + 1];
            // }
            // const elem1 = items[pos];
            // cons

            // console.log(elem1, elem2);
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

            items = list.querySelectorAll(".node");
            return ret;
        }




        // if (sortedList.equals(items))
        //     return null;
        // else {
        //     const oldIndex = items.indexOf(elem);
        //     const newIndex = sortedList.indexOf(elem);
        //     items = sortedList;

        //     for (let item of items)
        //         list.appendChild(item);

        //     return newIndex - oldIndex;
        // }
    }

    const redoY = (elem, e) => {
        fillDelta(e);

        elem.style.left = state.delta.x + "px";
        elem.style.top = state.delta.y + "px";
    }

    const onDrag = (elem, e) => {
        redoY(elem, e);

        const changes = rearrandeElements(elem);
        if (changes !== null) {
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
    };
    const onDragEnd = (elem, e) => {
        fillDelta(e);

        // rearrandeElements();
        elem.classList.remove('drag');

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


if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals.");

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

Object.defineProperty(Array.prototype, "equals", { enumerable: false });

if (Array.prototype.mismatch)
    console.warn("Overriding existing Array.prototype.mismatch.");

Array.prototype.mismatch = function (predicate) {
    for (var i = 1, l = this.length; i < l; i++) {
        if (predicate(this[i - 1], this[i]))
            return i - 1;
    }
    return -1;
}