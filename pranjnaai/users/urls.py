# users/urls.py
from django.urls import path
from . import views
from . import study_groups  # Import the study_groups module

urlpatterns = [
    # Existing user URLs
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('user-details/', views.get_user_details, name='user-details'),
    path('update-profile/<int:user_id>/', views.update_user_profile, name='update-profile'),
    path('change-password/', views.change_password, name='change-password'),
    path('delete-user/<int:user_id>/', views.delete_user, name='delete-user'),
    path('all-users/', views.get_all_users, name='all-users'),
    
    # Study Group URLs (these will be under /api/users/)
    path('study-groups/', study_groups.study_group_list, name='study_group_list'),
    path('study-groups/create/', study_groups.create_study_group, name='create_study_group'),
    path('study-groups/<int:group_id>/', study_groups.study_group_detail, name='study_group_detail'),
    path('study-groups/<int:group_id>/join/', study_groups.join_study_group, name='join_study_group'),
    path('study-groups/<int:group_id>/leave/', study_groups.leave_study_group, name='leave_study_group'),
    path('study-groups/my-groups/', study_groups.my_study_groups, name='my_study_groups'),
    path('study-groups/<int:group_id>/members/', study_groups.group_members, name='group_members'),
    
    # Discussion URLs
    path('discussion-topics/', study_groups.discussion_topic_list, name='discussion_topic_list'),
    path('discussion-topics/create/', study_groups.create_discussion_topic, name='create_discussion_topic'),
    path('discussion-topics/<int:topic_id>/', study_groups.discussion_topic_detail, name='discussion_topic_detail'),
    path('discussion-topics/<int:topic_id>/replies/', study_groups.topic_replies, name='topic_replies'),
    path('discussion-replies/create/', study_groups.create_reply, name='create_reply'),
    path('discussion-replies/<int:reply_id>/like/', study_groups.like_reply, name='like_reply'),
    
    # Message URLs
    path('group-messages/', study_groups.group_message_list, name='group_message_list'),
    path('group-messages/send/', study_groups.send_group_message, name='send_group_message'),
    path('group-messages/<int:group_id>/', study_groups.get_group_messages, name='get_group_messages'),
    
    # Event URLs
    path('group-events/', study_groups.group_event_list, name='group_event_list'),
    path('group-events/create/', study_groups.create_group_event, name='create_group_event'),
    path('group-events/<int:event_id>/', study_groups.group_event_detail, name='group_event_detail'),
]