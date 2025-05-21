package com.hihu.geetagpt;

import android.os.Bundle;                     // <-- Add this import
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.speechrecognition.SpeechRecognition;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register the speech recognition plugin
        registerPlugin(SpeechRecognition.class);
    }
}
