
/* --for-filter-menu-- */
$(document).on('click', '.project-filter li', function(){
  $(this).addClass('project-filter-active').siblings().removeClass('project-filter-active')
});

/* --for-project/work-filter*/
$(document).ready(function(){
  $('.list').click(function(){
    const value = $(this).attr('data-filter');
    if (value == 'all'){
      $('.project-box').show('800');
    } else {
      $('.project-box').not('.'+value).hide('800');
      $('.project-box').filter('.'+value).show('800');
    }
  });
});
