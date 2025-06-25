package de.trafficcue.trafficcue;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DuckPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
