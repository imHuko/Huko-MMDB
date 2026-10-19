
        function hasSession() { return Object.keys(localStorage).some(function(k){return k.startsWith('sb-') && localStorage.getItem(k);}); }
        if (sessionStorage.getItem('editor_logged_in') === 'true') {
            document.getElementById('editor-dropdown').style.display = 'inline-block';
            document.getElementById('admin-link').style.display = 'inline';
            document.getElementById('logout-link').style.display = 'inline';
            document.getElementById('login-link').style.display = 'none';
        }
                if (localStorage.getItem('user_logged_in') === 'true' || hasSession()) {
            document.getElementById('login-link').style.display = 'none';
            document.getElementById('signup-link').style.display = 'none';
            document.getElementById('admin-link').style.display = 'inline';
            document.getElementById('logout-link').style.display = 'inline';
        }
        function logout() {
            Object.keys(localStorage).filter(function(k){return k.startsWith('sb-');}).forEach(function(k){localStorage.removeItem(k);});
            sessionStorage.removeItem('editor_logged_in');
            sessionStorage.removeItem('editor_name');
            localStorage.removeItem('user_logged_in');
            localStorage.removeItem('username');
            location.reload();
        }
    