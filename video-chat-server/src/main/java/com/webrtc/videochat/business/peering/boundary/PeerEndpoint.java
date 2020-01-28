package com.webrtc.videochat.business.peering.boundary;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@ServerEndpoint("/peers")
public class PeerEndpoint implements PeeringEvent {
    private static final Logger LOGGER = LoggerFactory.getLogger(PeerEndpoint.class);
    private static Set<Session> sessions = new HashSet<>();
    private static Session initiator;

    @OnOpen
    public void onOpen(Session session, EndpointConfig ec) {
        LOGGER.info("session {} connected", session.getId());
        sessions.add(session);

        if (sessions.size() < 2) {
            if (sessions.size() == 1) {
                initiator = session;
                send(session, "InitPeer");
            }
        } else {
            send(session, "CreateSecondPeer");
            send(initiator, "PeerAdded");
        }
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        Map map = new Gson().fromJson(message, Map.class);
        Event event = new Event((String) map.get("name"), new Gson().toJson(map.get("data")));

        switch (event.getName()) {
            case "Offer":
                onOffer(event.getData());
                break;
            case "Answer":
                onAnswer(event.getData());
                break;
        }

        LOGGER.info("message received: {}", message);
    }

    @OnClose
    public void onClose(Session session, CloseReason cr) {
        LOGGER.info("session {} closed", session);
        sessions.remove(session);
    }

    @OnError
    public void onErrorCallback(Session s, Throwable t) {
        LOGGER.error("error for session " + s.getId(), t);
    }

    private void send(Session session, String message) {
        send(session, new Event(message, ""));
    }

    private void send(Session session, Event message) {
        try {
            session.getBasicRemote().sendText(new Gson().toJson(message));
        } catch (IOException e) {
            LOGGER.error("error sending message to session", e);
        }
    }

    @Override
    public void onOffer(String data) {
        sessions.stream().filter(session -> session != initiator).forEach(session -> send(session, new Event("OfferArrived", data)));
    }

    @Override
    public void onAnswer(String data) {
        send(initiator, new Event("AnswerArrived", data));
    }
}
