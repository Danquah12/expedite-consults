package com.conectln.app;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        cancelIncomingCallNotifications(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        cancelIncomingCallNotifications(intent);
    }

    private void cancelIncomingCallNotifications(Intent intent) {
        if (intent == null) return;
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            int notifId = intent.getIntExtra("notifId", 0);
            String callId = intent.getStringExtra("callId");
            Uri data = intent.getData();
            String dataStr = data != null ? data.toString() : "";
            boolean isCallLaunch = (callId != null && !callId.isEmpty()) || dataStr.contains("waCall=");
            if (notifId != 0) {
                nm.cancel(notifId);
            }
            if (isCallLaunch) {
                nm.cancelAll();
            }
        } catch (Exception ignored) { }
    }
}
