export const socket = {
    listeners: {},
    ws: null,
    connect: function() {
        this.ws = new WebSocket('ws://localhost:9080/video-chat/peers');
        var that = this;
        this.ws.addEventListener('message', function (event) {    
            var data = JSON.parse(event.data);
            console.log("data arrived", data);
            var fn = that.listeners[data.name];
        
            if (typeof fn === 'function') {
                fn(data.data);
            }
        });
    },
    emit: function (message, args) {
        var obj = {'name': message, 'data': args};
        this.ws.send(JSON.stringify(obj));
    },
    on: function (message, callback) {
        this.listeners[message] = callback;
    }
};

export default socket;