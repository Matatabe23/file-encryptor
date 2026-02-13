use std::fs;
use std::path::Path;
use tauri::Manager;

/// На Android возвращает папку, видимую пользователю (Фото). На десктопе — app_data_dir/files.
fn files_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
  #[cfg(target_os = "android")]
  {
    let base = app
      .path()
      .picture_dir()
      .map_err(|e: tauri::Error| e.to_string())?;
    Ok(base.join("FileEncryptor"))
  }
  #[cfg(not(target_os = "android"))]
  {
    let base = app
      .path()
      .app_data_dir()
      .map_err(|e: tauri::Error| e.to_string())?;
    Ok(base.join("files"))
  }
}

#[tauri::command]
fn get_file_name_from_path(app: tauri::AppHandle, path: String) -> Option<String> {
  app.path().file_name(&path)
}

#[tauri::command]
fn save_file_to_app(
  app: tauri::AppHandle,
  source_path: Option<String>,
  contents: Option<Vec<u8>>,
  file_name: Option<String>,
) -> Result<String, String> {
  let dir = files_dir(&app)?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

  if let Some(ref path) = source_path {
    let name = Path::new(path)
      .file_name()
      .and_then(|n| n.to_str())
      .ok_or_else(|| "Invalid file name".to_string())?;
    let dest = dir.join(name);
    fs::copy(path, &dest).map_err(|e| e.to_string())?;
    return dest
      .to_str()
      .map(String::from)
      .ok_or_else(|| "Invalid path".to_string());
  }

  if let (Some(data), Some(name)) = (contents, file_name) {
    let dest = dir.join(&name);
    fs::write(&dest, data).map_err(|e| e.to_string())?;
    return dest
      .to_str()
      .map(String::from)
      .ok_or_else(|| "Invalid path".to_string());
  }

  Err("Need either sourcePath or (contents + file_name)".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![save_file_to_app, get_file_name_from_path])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
