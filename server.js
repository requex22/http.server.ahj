const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const koaCors = require("koa-cors");
const { off } = require("process");
const uuid = require("uuid");

const app = new Koa();

const server = http.createServer(app.callback()).listen(8080);

app.use(
    koaBody({
        urlencoded: true,
        multipart: true,
        bodyparser: true,
    })
);

app.use(koaCors());

let tickets = [
    {
        id: uuid.v4(),
        name: "Поменять краску в принтере, ком. 404",
        description: "Принтер HP LJ 1210, картриджи на складе",
        status: false,
        created: initDate(),
    },
    {
        id: uuid.v4(),
        name: "Установить обновление КВ-ХХХ",
        description: "Вышло критическое обновление для Windows",
        status: false,
        created: initDate(),
    },
];

class TicketFull {
    constructor(name, description) {
        this.id = uuid.v4();
        this.name = name;
        this.description = description;
        this.status = false;
        this.created = initDate();
    }
}

function initDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear().toString().slice(2);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const resultDay = `${day < 10 ? "0" : ""}${day}.`;
    const resultMonth = `${month < 10 ? "0" : ""}${month}.`;
    const resultYear = `${year} ${hours < 10 ? "0" : ""}`;
    const resultTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

    const result = resultDay + resultMonth + resultYear + resultTime;
    return result;
}

app.use(async (ctx) => {
    const { method, id, status } = ctx.request.query;
    const { name, description } = ctx.request.body;

    console.log(method, id);
    switch (method) {
        case "allTickets":
            ctx.response.body = JSON.stringify(tickets);
            return;
        case `ticketById`:
            const ticket = tickets.filter((item) => item.id === id);
            if (ticket) ctx.response.body = JSON.stringify(ticket.description);
            return;
        case "createTicket":
            if (!name == "") {
                tickets.push(new TicketFull(name, description));
                ctx.response.body = JSON.stringify(tickets);
            } else {
                ctx.response.status = 404;
            }
            return;
        case "deleteTicket":
            const index = tickets.findIndex((item) => item.id == id);
            if (index !== -1) {
                ctx.response.body = JSON.stringify(tickets.splice(index, 1));
            }
            return;
        case "ticketDone":
            const donedTicket = tickets.findIndex((item) => item.id == id);
            if (donedTicket !== -1) {
                if (!tickets[donedTicket].status == true) {
                    tickets[donedTicket].status = true;
                } else {
                    tickets[donedTicket].status = false;
                }
                ctx.response.body = JSON.stringify(tickets);
            }
            return;
        case "editTicket":
            const editedTicket = tickets.findIndex((item) => item.id == id);
            if (editedTicket !== -1) {
                tickets[editedTicket].name = name;
                tickets[editedTicket].description = description;
            }
            ctx.response.body = JSON.stringify(tickets);
            return;
        // TODO: обработка остальных методов
        default:
            ctx.response.status = 404;
            return;
    }
});
