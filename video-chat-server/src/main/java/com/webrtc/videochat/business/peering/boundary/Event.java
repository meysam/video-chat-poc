package com.webrtc.videochat.business.peering.boundary;

public class Event {
    private String name;
    private String data;

    public Event() {
    }

    public Event(String name, String data) {
        this.name = name;
        this.data = data;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
