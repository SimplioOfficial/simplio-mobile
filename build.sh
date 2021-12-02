if [ "$CI_GIT_REF" = "master" ]; then
        case "$CI_PLATFORM" in
        "android") npm run build:ng:prod
        ;;
        "ios") npm run build:ios:prod
        ;;
        esac
    else
        npm run build:dev
        # case "$CI_PLATFORM" in
        # "android") npm run build:ng
        # ;;
        # "ios") npm run build:ios
        # ;;
        # esac
fi