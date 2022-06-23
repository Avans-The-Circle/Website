export class UserManager {

    private static setCookie(cname: string, cvalue: string, exdays: number) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    private static getCookie(cname: string) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    public static setUsername() {
        let user: string = this.getCookie("username") ?? `${Math.round(Math.random() * 10000)}`;
        user = prompt("Please enter your name:", user) ?? `${Math.round(Math.random() * 10000)}`;
        if (user !== "" && user != null) {
            this.setCookie("username", user, 30);
        }
        location.reload();
        return user;
    }

    public static getUsername() {
        let user: string = this.getCookie("username") ?? `${Math.round(Math.random() * 10000)}`;
        if (user === "") {
            user = prompt("Please enter your name:", "") ?? `${Math.round(Math.random() * 10000)}`;
            if (user !== "" && user != null) {
                this.setCookie("username", user, 30);
            }
        }
        return user;
    }
}
