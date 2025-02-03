<?php
/*
  Plugin Name: GPT-Article
  Plugin URI: 
  Description: GPTを使用した記事の生成補助
  Version: 1.0.0
  Author: uyuya
  Author URI: https://github.com/icchi-uyuya/
  Licence: 
*/

if (!defined('ABSPATH')) exit;

add_action('init', 'init_plugin');

function init_plugin() {
  if (is_admin() && is_user_logged_in()) { //権限チェック
    add_action('admin_menu', 'set_plugin_menu');
    
    add_action('admin_enqueue_scripts', 'app_admin_scripts');
    
    add_action('admin_init', 'init_plugin_settings');
  }
}

//設定画面のフィールド
function init_plugin_settings() {
  register_setting(
    'gpt-article', //設定グループ
    'gpt-article_main', //オプション名
  );
  add_settings_section(
    'gpt-article_main', //セクションID
    'てすと1', //セクションタイトル
    'show_api_key', //セクションの表示関数
    'gpt-article', //設定ページ
  );
  //FIXME フィールドが表示されない
  add_settings_field( 
    'api_key',
    'APIキー',
    function () {
    },
    'gpt-article',
    'gpt-article_main',
  );
}

//管理画面のメニューを設定
function set_plugin_menu() {
  add_menu_page(
    '記事生成',
    '記事生成',
    'manage_options',
    'gpt-article',
    'show_app',
    'dashicons-format-aside',
    99,
  );

  add_submenu_page(
    'gpt-article',
    '設定',
    '設定',
    'manage_options',
    'options',
    'show_option',
  );
}

function app_admin_scripts($hook_suffix) {

  if ($hook_suffix !== 'toplevel_page_gpt-article') {
    return;
  }

  $assets = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

  wp_enqueue_style(
    'gpt-article',
    plugin_dir_url(__FILE__) . 'build/index.css',
    array('wp-components'),
  );

  wp_enqueue_script(
    'gpt-article',
    plugin_dir_url(__FILE__) . 'build/index.js',
    $assets['dependencies'],
    $assets['version'],
    true, 
  );
}

function show_app() {
?>
  <h1>記事の生成   試作版</h1>
  <p class="description">
    このプラグインはOpenAIのGPTを使用して記事を生成するための補助ツールです。
    以下のフォームに記事のタイトルと内容を入力してください。
  </p>
  <div id="app"></div>
<?php
}
?>

<?php
function show_option() {
?>
  <h1>プラグインの設定</h1>
  <h2>APIキーの設定</h2>
  <p class="description">
    有効なOpenAIのAPIキーを入力してください。
    この項目の入力はChatGPTで文章を生成するプログラムを動作させるのに必要となります。<br>
    OpenAIアカウントを作成していない場合は公式サイト
    <a href="https://openai.com/index/openai-api/">https://openai.com/index/openai-api/</a>
    にアクセスしてアカウントを作成し、新たなキーを発行してください。
  </p>
  <form method="post" action="options.php">
    <?php
      settings_fields('gpt-article'); //設定グループ
      do_settings_sections('gpt-article_main'); //セクション名
      submit_button();
    ?>
  </form>
  <h2>使用する言語モデル</h2>
  <p class="description">
    文章を生成する際に使用する言語モデルを選択できます。
  </p>
  <select id="gpt-model">
    <option value="4o-mini">GPT 4o-mini</option>
  </select>
  
<?php
}
?>