<?php
/**
 * Setup Widget: Info
 * @since Wokingham Vineyard 1.0
 *
 */
class wv_content_box extends WP_Widget {


  // Widget settings
  function __construct() {
    parent::__construct(
      'content-box', // Widget ID
      __( 'Content Box' ), // Name
      array( 'description' => __( 'Add an content box to your widget area, with a title and some content.' ), ) // Description
    );
  }


  // Front-end
  public function widget( $themeVars, $widget ) {
    // Variables
    $title = apply_filters( 'widget_title', $widget['title'] );
    $content = apply_filters( 'widget_title', $widget['content'] );
    $width = apply_filters( 'widget_title', $widget['width'] );

    // HTML
    echo "<div class='grid__item " . $width . "'>";
      echo $themeVars['before_widget'];
      echo ( !empty( $title ) ) ? $themeVars['before_title'] . $title . $themeVars['after_title'] : '';
      echo ( !empty( $content ) ) ? '<div class="widget__content">' . $content . '</div>' : '';
      echo $themeVars['after_widget'];
    echo "</div>";
  }


  // Back-end: Form
  public function form( $widget ) {
    $title = ( !empty( $widget[ 'title' ] ) ) ? $widget[ 'title' ] : '';
    $content = ( !empty( $widget[ 'content' ] ) ) ? $widget[ 'content' ] : '';
    $width = ( !empty( $widget[ 'width' ] ) ) ? $widget[ 'width' ] : 'one-third';
    ?>
    <p>
      <label for="<?php echo $this->get_field_id( 'width' ); ?>"><?php _e( 'Width:' ); ?></label>
        <select class="widefat" id="<?php echo $this->get_field_id( 'width' ); ?>" name="<?php echo $this->get_field_name( 'width' ); ?>" type="text">
          <option value="one-half" <?php echo ( $width == 'one-half' ) ? 'selected' : ''; ?>>One half</option>
          <option value="one-third" <?php echo ( $width == 'one-third' ) ? 'selected' : ''; ?>>One third</option>
          <option value="two-thirds" <?php echo ( $width == 'two-thirds' ) ? 'selected' : ''; ?>>Two thirds</option>
          <option value="one-quarter" <?php echo ( $width == 'one-quarter' ) ? 'selected' : ''; ?>>One quarter</option>
          <option value="three-quarters" <?php echo ( $width == 'three-quarters' ) ? 'selected' : ''; ?>>Three quarters</option>
          <option value="one-fifth" <?php echo ( $width == 'one-fifth' ) ? 'selected' : ''; ?>>One fifth</option>
          <option value="two-fifths" <?php echo ( $width == 'two-fifths' ) ? 'selected' : ''; ?>>Two fifths</option>
          <option value="Three-fifths" <?php echo ( $width == 'Three-fifths' ) ? 'selected' : ''; ?>>Three fifths</option>
          <option value="Four-fifths" <?php echo ( $width == 'Four-fifths' ) ? 'selected' : ''; ?>>Four fifths</option>
        </select>
      </label>
    </p>
    <p>
      <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
        <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" placeholder="New title">
      </label>
    </p>
    <p>
      <label for="<?php echo $this->get_field_id( 'content' ); ?>"><?php _e( 'Content:' ); ?></label>
        <textarea class="widefat" id="<?php echo $this->get_field_id( 'content' ); ?>" name="<?php echo $this->get_field_name( 'content' ); ?>" type="text" placeholder="It's all about the information box!"><?php echo esc_attr( $content ); ?></textarea>
      </label>
    </p>
    <?php
  }


  // Back-end: Updater
  public function update( $new_instance, $old_instance ) {
    $instance = array();
    $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
    $instance['content'] = ( ! empty( $new_instance['content'] ) ) ? strip_tags( $new_instance['content'] ) : '';
    $instance['width'] = ( ! empty( $new_instance['width'] ) ) ? strip_tags( $new_instance['width'] ) : 'one-third';
    return $instance;
  }


}



/**
 * Register & Load Widget: Info
 * @since Wokingham Vineyard 1.0
 *
 */
function wv_load_widget() {
  register_widget( 'wv_content_box' );
}
add_action( 'widgets_init', 'wv_load_widget' );
