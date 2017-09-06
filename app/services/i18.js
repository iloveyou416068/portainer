angular.module('portainer.services')
    .factory('languageSwitch', ['$translate', function($translate) {
        var languageSwitch = {
            T:function(key) {
                if(key){
                    return $translate.instant(key);
                }
                return key;
            }
        }
        return languageSwitch;
    }]);
