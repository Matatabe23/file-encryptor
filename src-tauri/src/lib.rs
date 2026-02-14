use std::fs;
use std::path::Path;
use tauri::Manager;

/// Единая структура: на ПК app_data/files/{save_type}, на Android — внешняя папка приложения (Pictures/...), куда точно можно писать.
fn files_dir_for_type(app: &tauri::AppHandle, save_type: &str) -> Result<std::path::PathBuf, String> {
  #[cfg(target_os = "android")]
  {
    let base = app
      .path()
      .picture_dir()
      .map_err(|e: tauri::Error| e.to_string())?;
    Ok(base.join(save_type))
  }
  #[cfg(not(target_os = "android"))]
  {
    let base = app
      .path()
      .app_data_dir()
      .map_err(|e: tauri::Error| e.to_string())?;
    Ok(base.join("files").join(save_type))
  }
}

#[tauri::command]
fn get_file_name_from_path(app: tauri::AppHandle, path: String) -> Option<String> {
  app.path().file_name(&path)
}

#[tauri::command]
fn save_file_to_app(
  app: tauri::AppHandle,
  save_type: String,
  source_path: Option<String>,
  contents: Option<Vec<u8>>,
  file_name: Option<String>,
) -> Result<String, String> {
  let dir = files_dir_for_type(&app, &save_type)?;
  if cfg!(debug_assertions) {
    log::info!("save_file_to_app: dir = {:?}", dir);
  }
  fs::create_dir_all(&dir).map_err(|e| {
    let msg = format!("create_dir_all {:?}: {}", dir, e);
    log::error!("{}", msg);
    msg
  })?;

  if let Some(ref path) = source_path {
    let name = Path::new(path)
      .file_name()
      .and_then(|n| n.to_str())
      .ok_or_else(|| "Invalid file name".to_string())?;
    let dest = dir.join(name);
    fs::copy(path, &dest).map_err(|e| {
      let msg = format!("copy {} -> {:?}: {}", path, dest, e);
      log::error!("{}", msg);
      msg
    })?;
    return dest
      .to_str()
      .map(String::from)
      .ok_or_else(|| "Invalid path".to_string());
  }

  if let (Some(data), Some(name)) = (contents, file_name) {
    let dest = dir.join(&name);
    fs::write(&dest, &data).map_err(|e| {
      let msg = format!("write {:?} ({} bytes): {}", dest, data.len(), e);
      log::error!("{}", msg);
      msg
    })?;
    return dest
      .to_str()
      .map(String::from)
      .ok_or_else(|| "Invalid path".to_string());
  }

  Err("Need either sourcePath or (contents + file_name)".to_string())
}

/// Read file content from app storage (path previously returned by save_file_to_app).
#[tauri::command]
fn read_file_from_app(app: tauri::AppHandle, path: String) -> Result<Vec<u8>, String> {
  #[cfg(target_os = "android")]
  let allowed = app
    .path()
    .picture_dir()
    .map_err(|e: tauri::Error| e.to_string())?
    .to_string_lossy()
    .to_string();
  #[cfg(not(target_os = "android"))]
  let allowed = app
    .path()
    .app_data_dir()
    .map_err(|e: tauri::Error| e.to_string())?
    .to_string_lossy()
    .to_string();
  let path_normalized = Path::new(&path).to_string_lossy().to_string();
  if !path_normalized.starts_with(&allowed) {
    return Err("Path not allowed".to_string());
  }
  fs::read(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![save_file_to_app, get_file_name_from_path, read_file_from_app])
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
