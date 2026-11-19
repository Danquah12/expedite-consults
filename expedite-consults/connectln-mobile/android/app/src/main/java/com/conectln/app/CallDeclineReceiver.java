package com.conectln.app;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class CallDeclineReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        int id = intent.getIntExtra("notifId", 0);
        final String callId = intent.getStringExtra("callId");
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.cancel(id);
        if (callId == null || callId.isEmpty()) return;
        new Thread(() -> {
            try {
                URL url = new URL("https://conectln.com/api/v1/calls");
                HttpURLConnection c = (HttpURLConnection) url.openConnection();
                c.setRequestMethod("POST");
                c.setRequestProperty("Content-Type", "application/json");
                c.setDoOutput(true);
                String body = "{\"action\":\"end\",\"call_id\":\"" + callId.replace("\"", "") + "\",\"user_id\":\"declined_push\"}";
                try (OutputStream os = c.getOutputStream()) { os.write(body.getBytes("UTF-8")); }
                c.getResponseCode();
                c.disconnect();
            } catch (Exception ignored) { }
        }).start();
    }
}
