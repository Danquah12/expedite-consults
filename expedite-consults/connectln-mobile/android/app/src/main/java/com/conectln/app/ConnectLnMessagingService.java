package com.conectln.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.Person;

import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * Receives FCM data messages (type=INCOMING_CALL) while the app is closed / phone locked and
 * raises a WhatsApp-style full-screen incoming-call screen with ringtone. Everything else is
 * delegated to the Capacitor push plugin.
 */
public class ConnectLnMessagingService extends MessagingService {
    static final String CALL_CHANNEL_ID = "connectln_incoming_calls_v1";

    @Override
    public void onMessageReceived(RemoteMessage message) {
        Map<String, String> data = message.getData();
        if (data != null && "INCOMING_CALL".equals(data.get("type"))) {
            showIncomingCall(data);
            return;
        }
        super.onMessageReceived(message);
    }

    private void showIncomingCall(Map<String, String> data) {
        Context ctx = getApplicationContext();
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        Uri ringtone = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                    CALL_CHANNEL_ID, "Incoming ConnectLn calls", NotificationManager.IMPORTANCE_HIGH);
            ch.setSound(ringtone, new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 700, 400, 700, 400, 900});
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }

        String callId = data.get("callId") == null ? "" : data.get("callId");
        String mode = data.get("callMode") == null ? "video" : data.get("callMode");
        String caller = data.get("callerName") == null ? "ConnectLn Caller" : data.get("callerName");
        String joinUrl = data.get("joinUrl");
        if (joinUrl == null || joinUrl.isEmpty()) {
            joinUrl = "https://conectln.com/connectin?waCall=" + Uri.encode(callId)
                    + "&mode=" + mode + "&callerName=" + Uri.encode(caller) + "&autoAnswer=1";
        }

        Intent open = new Intent(ctx, MainActivity.class);
        open.setAction(Intent.ACTION_VIEW);
        open.setData(Uri.parse(joinUrl));
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        int id = callId.hashCode();
        open.putExtra("notifId", id);
        open.putExtra("callId", callId);
        PendingIntent answerPi = PendingIntent.getActivity(ctx, id, open, flags);

        Intent decline = new Intent(ctx, CallDeclineReceiver.class);
        decline.putExtra("notifId", id);
        decline.putExtra("callId", callId);
        PendingIntent declinePi = PendingIntent.getBroadcast(ctx, id + 1, decline, flags);

        Person callerPerson = new Person.Builder()
                .setName(caller)
                .setImportant(true)
                .build();

        NotificationCompat.CallStyle callStyle = NotificationCompat.CallStyle
                .forIncomingCall(callerPerson, declinePi, answerPi)
                .setIsVideo("video".equals(mode))
                .setAnswerButtonColorHint(0xFF25D366)
                .setDeclineButtonColorHint(0xFFFF3B30);

        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CALL_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .setContentTitle(caller)
                .setContentText("video".equals(mode) ? "ConnectLn Video Call" : "ConnectLn Voice Call")
                .setStyle(callStyle)
                .setColor(0xFF075E54)
                .setColorized(true)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(true)
                .setTimeoutAfter(45000)
                .setSound(ringtone)
                .setFullScreenIntent(answerPi, true)
                .setContentIntent(answerPi);

        Notification n = b.build();
        n.flags |= Notification.FLAG_INSISTENT; // keep ringing until answered/declined/timeout
        nm.notify(id, n);
    }
}
