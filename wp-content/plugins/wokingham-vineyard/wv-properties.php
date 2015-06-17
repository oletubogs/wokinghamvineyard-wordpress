<?php
// create custom settings menu
add_action('admin_menu', 'wv_create_menu');

function wv_create_menu() {
  add_menu_page(
    'WV Properties',
    'WV Properties',
    'delete_posts',
    'wv_properties',
    'wv_properties_page',
    'dashicons-networking',
    '10'
  );

  add_action( 'admin_init', 'register_mysettings' );
}

function register_mysettings() {
  register_setting( 'wv-settings-group', 'twitter_username' );
  register_setting( 'wv-settings-group', 'instagram_username' );
  register_setting( 'wv-settings-group', 'option_etc' );
}

function admin_notice_success(){
    echo '<div class="updated">
       <p>Great, your social media settings have been updated!</p>
    </div>';
}

if (!empty($_POST)) :

  $success = 0;
  $twitter = sanitize_text_field($_POST['twitter_username']);
  $instagram = sanitize_text_field($_POST['instagram_username']);

  if (!empty($_POST['twitter_username'])) :
    update_option('twitter_username', $twitter);
    $success = 1;
  endif;
  if (!empty($_POST['instagram_username'])) :
    update_option('instagram_username', $instagram);
    $success = 1;
  endif;

  if ($success == 1) :
    add_action('admin_notices', 'admin_notice_success');
  endif;

endif;

function wv_properties_page() {
?>
<div class="wrap">
<h2>Wokingham Vineyard: Properties</h2>

<form method="post" action="admin.php?page=wv_properties">
  <?php settings_fields( 'wv-settings-group' ); ?>
  <?php do_settings_sections( 'wv-settings-group' ); ?>

  <table class="form-table">
    <tr valign="top">
      <th scope="row">Church Twitter username</th>
      <td>
        <input type="text" name="twitter_username" value="<?php echo esc_attr( get_option('twitter_username') ); ?>" />
      </td>
    </tr>

    <tr valign="top">
      <th scope="row">Church Instagram username</th>
      <td>
        <input type="text" name="instagram_username" value="<?php echo esc_attr( get_option('instagram_username') ); ?>" />
      </td>
    </tr>
  </table>

  <?php submit_button(); ?>

</form>
</div>
<?php } ?>
