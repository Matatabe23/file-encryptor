use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

const GITHUB_API_LATEST: &str = "https://api.github.com/repos/Matatabe23/file-encryptor/releases/latest";

#[derive(serde::Serialize)]
struct CheckUpdateResult {
  has_update: bool,
  version: String,
  download_url: Option<String>,
  body: Option<String>,
}

#[derive(serde::Deserialize)]
struct GitHubRelease {
  tag_name: String,
  body: Option<String>,
  assets: Vec<GitHubAsset>,
}

#[derive(serde::Deserialize)]
struct GitHubAsset {
  name: String,
  browser_download_url: String,
}

/// Сравнение версий "0.1.4" и "0.1.5". Возвращает true если remote > current.
fn version_greater(current: &str, remote: &str) -> bool {
  let parse = |s: &str| {
    let s = s.trim_start_matches('v');
    let parts: Vec<u32> = s
      .split('.')
      .filter_map(|p| p.parse::<u32>().ok())
      .collect();
    (parts.get(0).copied().unwrap_or(0), parts.get(1).copied().unwrap_or(0), parts.get(2).copied().unwrap_or(0))
  };
  let (c_maj, c_min, c_patch) = parse(current);
  let (r_maj, r_min, r_patch) = parse(remote);
  (r_maj, r_min, r_patch) > (c_maj, c_min, c_patch)
}

/// Выбор URL ассета по платформе: Windows -> *x64-setup.exe, Android -> *.apk, macOS -> *.dmg, Linux -> *.AppImage и т.д.
fn pick_asset_url(assets: &[GitHubAsset], os: &str) -> Option<String> {
  let name_lower = |a: &GitHubAsset| a.name.to_lowercase();
  for a in assets {
    let n = name_lower(a);
    let url = a.browser_download_url.clone();
    match os {
      "windows" if n.ends_with(".exe") && (n.contains("x64") || n.contains("setup")) => return Some(url),
      "android" if n.ends_with(".apk") => return Some(url),
      "macos" if n.ends_with(".dmg") || n.ends_with(".app.tar.gz") || n.contains("macos") => return Some(url),
      "ios" if n.ends_with(".ipa") || n.contains("ios") => return Some(url),
      "linux" if n.ends_with(".appimage") || n.ends_with(".deb") || n.contains("linux") => return Some(url),
      _ => {}
    }
  }
  // Fallback: по расширению
  for a in assets {
    let n = name_lower(a);
    match os {
      "windows" if n.ends_with(".exe") => return Some(a.browser_download_url.clone()),
      "android" if n.ends_with(".apk") => return Some(a.browser_download_url.clone()),
      _ => {}
    }
  }
  None
}

#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<CheckUpdateResult, String> {
  let current = app.package_info().version.to_string();
  let os = std::env::consts::OS; // "windows" | "android" | "linux" | "macos"

  let client = reqwest::Client::builder()
    .user_agent("file-encryptor-updater")
    .build()
    .map_err(|e| e.to_string())?;

  let resp = client
    .get(GITHUB_API_LATEST)
    .send()
    .await
    .map_err(|e| e.to_string())?;

  if !resp.status().is_success() {
    return Err(format!("GitHub API error: {}", resp.status()));
  }

  let release: GitHubRelease = resp.json().await.map_err(|e| e.to_string())?;
  let remote_version = release.tag_name.trim_start_matches('v').to_string();

  if !version_greater(&current, &remote_version) {
    return Ok(CheckUpdateResult {
      has_update: false,
      version: current,
      download_url: None,
      body: None,
    });
  }

  let download_url = pick_asset_url(&release.assets, os);
  Ok(CheckUpdateResult {
    has_update: download_url.is_some(),
    version: remote_version,
    download_url,
    body: release.body,
  })
}

/// Скачивает файл по URL во временную папку и возвращает путь. Фронт может открыть через plugin-opener.
#[tauri::command]
async fn download_update(download_url: String) -> Result<String, String> {
  let client = reqwest::Client::builder()
    .user_agent("file-encryptor-updater")
    .build()
    .map_err(|e| e.to_string())?;

  let resp = client
    .get(&download_url)
    .send()
    .await
    .map_err(|e| e.to_string())?;

  if !resp.status().is_success() {
    return Err(format!("Download failed: {}", resp.status()));
  }

  let filename: String = resp
    .url()
    .path_segments()
    .and_then(|s| s.last())
    .unwrap_or("update")
    .to_string();
  let filename = if filename.is_empty() || filename == "update" {
    if download_url.contains(".apk") {
      "file-encryptor-update.apk".to_string()
    } else if download_url.contains(".exe") {
      "file-encryptor-setup.exe".to_string()
    } else {
      "file-encryptor-update".to_string()
    }
  } else {
    filename
  };

  let dir = std::env::temp_dir();
  let path = dir.join(&filename);
  let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
  fs::write(&path, &bytes).map_err(|e| e.to_string())?;

  path
    .to_str()
    .map(String::from)
    .ok_or_else(|| "Invalid path".to_string())
}

/// Базовая папка для файлов приложения. Относительные пути хранятся от неё.
fn files_base_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  #[cfg(target_os = "android")]
  {
    app
      .path()
      .picture_dir()
      .map_err(|e: tauri::Error| e.to_string())
  }
  #[cfg(not(target_os = "android"))]
  {
    app
      .path()
      .app_data_dir()
      .map_err(|e: tauri::Error| e.to_string())
      .map(|p| p.join("files"))
  }
}

/// Папка конкретной коллекции: base/collections/{collection_id}
fn collection_dir(app: &tauri::AppHandle, collection_id: &str) -> Result<PathBuf, String> {
  Ok(files_base_dir(app)?.join("collections").join(collection_id))
}

/// Единая структура: на ПК app_data/files/{save_type}, на Android — picture_dir/{save_type}. Оставлено для обратной совместимости.
fn files_dir_for_type(app: &tauri::AppHandle, save_type: &str) -> Result<PathBuf, String> {
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
fn get_files_base_path(app: tauri::AppHandle) -> Result<String, String> {
  let base = files_base_dir(&app)?;
  base
    .to_str()
    .map(String::from)
    .ok_or_else(|| "Invalid base path".to_string())
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

/// Сохранить файл в папку коллекции. Возвращает относительный путь: collections/{collection_id}/{file_name}
#[tauri::command]
fn save_file_to_collection(
  app: tauri::AppHandle,
  collection_id: String,
  file_name: String,
  source_path: Option<String>,
  contents: Option<Vec<u8>>,
) -> Result<String, String> {
  let dir = collection_dir(&app, &collection_id)?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

  let name = Path::new(&file_name)
    .file_name()
    .and_then(|n| n.to_str())
    .ok_or_else(|| "Invalid file name".to_string())?
    .to_string();

  if let Some(ref path) = source_path {
    let dest = dir.join(&name);
    fs::copy(path, &dest).map_err(|e| e.to_string())?;
    let relative = format!("collections/{}/{}", collection_id, name);
    return Ok(relative);
  }

  if let Some(data) = contents {
    let dest = dir.join(&name);
    fs::write(&dest, &data).map_err(|e| e.to_string())?;
    let relative = format!("collections/{}/{}", collection_id, name);
    return Ok(relative);
  }

  Err("Need either source_path or contents".to_string())
}

/// Read file content. path — относительный (collections/...) или полный (для совместимости).
#[tauri::command]
fn read_file_from_app(app: tauri::AppHandle, path: String) -> Result<Vec<u8>, String> {
  let base = files_base_dir(&app)?;
  let base_str = base.to_string_lossy().to_string();
  let path_buf = PathBuf::from(&path);
  let full = if path_buf.is_absolute() {
    path_buf
  } else {
    base.join(path)
  };
  let full_str = full.to_string_lossy().to_string();
  if !full_str.starts_with(&base_str) {
    return Err("Path not allowed".to_string());
  }
  fs::read(&full).map_err(|e| e.to_string())
}

/// Удалить файл по относительному или полному пути в пределах base.
#[tauri::command]
fn delete_app_file(app: tauri::AppHandle, path: String) -> Result<(), String> {
  let base = files_base_dir(&app)?;
  let base_str = base.to_string_lossy().to_string();
  let path_buf = PathBuf::from(&path);
  let full = if path_buf.is_absolute() {
    path_buf
  } else {
    base.join(path)
  };
  let full_str = full.to_string_lossy().to_string();
  if !full_str.starts_with(&base_str) {
    return Err("Path not allowed".to_string());
  }
  if full.exists() {
    fs::remove_file(&full).map_err(|e| e.to_string())?;
  }
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![
    get_files_base_path,
    save_file_to_app,
    save_file_to_collection,
    get_file_name_from_path,
    read_file_from_app,
    delete_app_file,
    check_for_update,
    download_update,
  ])
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
