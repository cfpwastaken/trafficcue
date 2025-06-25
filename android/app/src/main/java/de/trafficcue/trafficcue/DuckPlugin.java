package de.trafficcue.trafficcue;

import android.content.Context;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Duck")
public class DuckPlugin extends Plugin {

    private AudioFocusRequest focusRequest;
    private AudioManager audioManager;

    @Override
    public void load() {
        super.load();

        audioManager = (AudioManager) getBridge().getActivity().getSystemService(Context.AUDIO_SERVICE);
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @PluginMethod()
    public void duck(PluginCall call) {
//        String value = call.getString("value");
//
//        JSObject ret = new JSObject();
//        ret.put("value", value);
//        call.resolve(ret);
        focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAcceptsDelayedFocusGain(false)
                .setWillPauseWhenDucked(false)
                .setForceDucking(true)
                .build();

        audioManager.requestAudioFocus(focusRequest);

        call.resolve();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @PluginMethod()
    public void unduck(PluginCall call) {
        audioManager.abandonAudioFocusRequest(focusRequest);

        call.resolve();
    }
}