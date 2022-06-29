import Vue from 'vue';

const drag = Vue.directive('drag', {
    inserted(el) {
        el.onmousedown = e => {
            let disX = e.pageX - el.offsetLeft;
            let disY = e.pageY - el.offsetTop;
            document.onmousemove = e => {
                el.style.left = e.pageX - disX + 'px';
                el.style.top = e.pageY - disY + 'px';
            }
            setTimeout(() => {
                document.onmousemove = null;
            }, 800)
        }
        el.onmouseup = () => {
            document.onmousemove = null;
        }
    },
    update(el, binding){
        if(binding.value && binding.oldValue !== undefined && !binding.oldValue)
        {
            el.onmousedown = e => {
                let disX = e.pageX - el.offsetLeft;
                let disY = e.pageY - el.offsetTop;
                document.onmousemove = e => {
                    el.style.left = e.pageX - disX + 'px';
                    el.style.top = e.pageY - disY + 'px';
                }
                setTimeout(() => {
                    document.onmousemove = null;
                }, 800)
            }
        }
        if(!binding.value && binding.oldValue)
        {
            el.onmousedown = null;
        }
    }
})

export default drag;