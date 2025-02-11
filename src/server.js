import Fastify from "fastify";
import fs from "fs";
import path from "path";

const port = 3000;

// Charger les fichiers du certificat
const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), "server.key")),
    cert: fs.readFileSync(path.join(process.cwd(), "server.crt"))
};

// Initialiser Fastify avec HTTPS
const fastify = Fastify({
    logger: true,
    https: httpsOptions
});

// Route accessible sans authentification
fastify.get('/dmz', {}, (req, res) => {
    res.send({ replique: "Ça pourrait être mieux protégé..." });
});

// Configuration de Basic Auth
import fastifyBasicAuth from "@fastify/basic-auth";

const authenticate = { realm: "Westeros" };

fastify.register(fastifyBasicAuth, {
    validate,
    authenticate
});

async function validate(username, password, req, reply) {
    if (username !== "Tyrion" || password !== "wine") {
        throw new Error("Winter is coming");
    }
}

// Déclarer les routes après l'initialisation des plugins
fastify.after(() => {
    fastify.route({
        method: "GET",
        url: "/secu",
        onRequest: fastify.basicAuth,
        handler: async (req, reply) => {
            return { replique: "Un Lannister paye toujours ses dettes !" };
        }
    });

    fastify.route({
        method: "GET",
        url: "/autre",
        handler: async (req, reply) => {
            return { replique: "Accessible sans authentification !" };
        }
    });
});

// Gestion des erreurs personnalisée
fastify.setErrorHandler((err, req, reply) => {
    if (err.statusCode === 401) {
        console.log(err);
        reply.code(401).send({ replique: "Tu ne sais rien, Jon Snow..." });
    }
    reply.send(err);
});

// Lancer le serveur HTTPS
fastify.listen({ port }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Fastify écoute sur : ${address}`);
});
