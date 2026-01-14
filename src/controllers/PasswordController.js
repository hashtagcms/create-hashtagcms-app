const FrontendBaseController = require('./FrontendBaseController');

class PasswordController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        // todo: handle password reset
        return super.index(req, res);
    }
}
module.exports = PasswordController;
