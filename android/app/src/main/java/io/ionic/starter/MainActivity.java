package io.ionic.starter;

import android.os.Bundle;

import com.ahm.capacitor.camera.preview.CameraPreview;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import android.graphics.Camera;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(CameraPreview.class);
    }});
  }
}