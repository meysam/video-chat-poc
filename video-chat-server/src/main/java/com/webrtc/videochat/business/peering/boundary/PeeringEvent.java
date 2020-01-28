package com.webrtc.videochat.business.peering.boundary;

public interface PeeringEvent {
    void onOffer(String data);

    void onAnswer(String data);
}
