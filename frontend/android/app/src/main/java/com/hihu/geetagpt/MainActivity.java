package com.hihu.geetagpt;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.speechrecognition.SpeechRecognition;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register the speech recognition plugin
        registerPlugin(SpeechRecognition.class);

        // Register the push notifications plugin
        registerPlugin(PushNotificationsPlugin.class);
    }
}