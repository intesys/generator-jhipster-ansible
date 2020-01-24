const chalk = require('chalk');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const packagejs = require('../../package.json');

const templateProperties = ['spring.datasource.url', 'spring.datasource.username'];
const templateSecretProperties = ['spring.datasource.password', 'jhipster.security.authentication.jwt.base64-secret'];

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            readConfig() {
                this.jhipsterAppConfig = this.getAllJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Cannot read .yo-rc.json');
                }
            },
            displayLogo() {
                this.printJHipsterLogo();
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster ansible')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(
                        `\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`
                    );
                }
            },
            checkAnsibleCanBeUsed() {
                const skipServer = this.jhipsterAppConfig.skipServer;
                if (skipServer === true) {
                    this.error('This module cannot be use without a jhipster backend');
                }
            }
        };
    }

    prompting() {
        const prompts = [
            {
                when: () => typeof this.message === 'undefined',
                type: 'input',
                name: 'ansibleWorkspacePath',
                message: `${chalk.yellow('*Ansible Directory*')}: Enter the ansible workspace directory`,
                default: './ansible'
            },
            {
                type: 'input',
                name: 'mavenSnapshotsUrl',
                message: `${chalk.yellow('*Maven*')}: what is the URL of distributionManagement for snapshots ?`,
                default: 'http://artifactory:8081/artifactory/libs-snapshot'
            },
            {
                type: 'input',
                name: 'mavenReleasesUrl',
                message: `${chalk.yellow('*Maven*')}: what is the URL of distributionManagement for releases ?`,
                default: 'http://artifactory:8081/artifactory/libs-release'
            },
            {
                type: 'input',
                name: 'hosts',
                message: `${chalk.yellow('*Enviroments*')}: which enviroments do you want to deploy to (comma separated) ?`,
                default: 'test,staging,prod',
                validate: input => {
                    if (input === '') {
                        return 'You must specify at least one environment';
                    }
                    // Commas allowed so that user can input a list of values split by commas.
                    if (!/^[A-Za-z0-9_,]+$/.test(input)) {
                        return 'Environment names cannot contain special characters (allowed characters: A-Z, a-z, 0-9 and _)';
                    }
                    const enums = input.replace(/\s/g, '').split(',');
                    if (_.uniq(enums).length !== enums.length) {
                        return `Environment names cannot contain duplicates (typed values: ${input})`;
                    }
                    for (let i = 0; i < enums.length; i++) {
                        if (enums[i] === '') {
                            return 'Enviroment names cannot be empty (did you accidentally type "," twice in a row?)';
                        }
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'sshUser',
                message: `${chalk.yellow('*SSH User*')}: 'what is the ssh user you will use to deploy (not mandatory)) ?`,
                default: null
            }
        ];

        const done = this.async();
        this.prompt(prompts).then(answers => {
            this.promptAnswers = answers;
            // To access props answers use this.promptAnswers.someOption;
            done();
        });
    }

    writing() {
        // read config from .yo-rc.json
        this.appName = _.kebabCase(this.jhipsterAppConfig.baseName);
        this.snakeCaseAppName = _.snakeCase(this.jhipsterAppConfig.baseName);
        this.packageName = this.jhipsterAppConfig.packageName;
        this.ansibleWorkspacePath = this.promptAnswers.ansibleWorkspacePath;
        this.mavenReleasesUrl = this.promptAnswers.mavenReleasesUrl;
        this.mavenSnapshotsUrl = this.promptAnswers.mavenSnapshotsUrl;
        this.sshUser = this.promptAnswers.sshUser;

        this.template('README.md', `${this.ansibleWorkspacePath}/README.md`);
        this.template('ansible.cfg', `${this.ansibleWorkspacePath}/ansible.cfg`);
        this.template('jhipster-playbook.yml', `${this.ansibleWorkspacePath}/${this.appName}-playbook.yml`);
        this.template('hosts/shared-secrets.yml', `${this.ansibleWorkspacePath}/hosts/shared-secrets.yml`);
        this.template('hosts/shared-vars.yml', `${this.ansibleWorkspacePath}/hosts/shared-vars.yml`);
        this.template('requirements.yml', `${this.ansibleWorkspacePath}/requirements.yml`);
        this.template('ansible.cfg', `${this.ansibleWorkspacePath}/ansible.cfg`);
        this.copy('.gitignore', `${this.ansibleWorkspacePath}/.gitignore`);
        this.template(
            'ansible-templates/logback-spring.xml.j2',
            `${this.ansibleWorkspacePath}/templates/${this.appName}/logback-spring.xml.j2`
        );

        const configFolder = path.resolve(this.destinationPath(), jhipsterConstants.SERVER_MAIN_RES_DIR, 'config');

        // replace secret configuration with ansible vault variables
        const projectApplicationProps = path.resolve(configFolder, 'application-prod.yml');
        if (!fs.existsSync(projectApplicationProps)) {
            this.error(`file ${projectApplicationProps} does not exists in the jhipster project`);
        }
        const prodConfig = yaml.safeLoad(fs.readFileSync(projectApplicationProps), 'utf-8');

        this.inventoryVars = [];
        this.inventoryVaults = [];
        templateProperties.forEach(property => {
            const propValue = _.get(prodConfig, property);
            if (propValue) {
                const ansiblePropKey = property.replace(/\./g, '_').replace(/-/g, '_');
                this.inventoryVars.push(`${ansiblePropKey}: ${propValue}`);
                _.set(prodConfig, property, `{{${this.snakeCaseAppName}.${ansiblePropKey}}}`);
            }
        });

        templateSecretProperties.forEach(property => {
            const propValue = _.get(prodConfig, property);
            if (propValue) {
                const ansiblePropKey = property.replace(/\./g, '_').replace(/-/g, '_');
                this.inventoryVars.push(`${ansiblePropKey}: "{{${this.snakeCaseAppName}.vault_${ansiblePropKey}}}"`);
                this.inventoryVaults.push(`vault_${ansiblePropKey}: ${propValue}`);
                _.set(prodConfig, property, `{{${this.snakeCaseAppName}.${ansiblePropKey}}}`);
            }
        });

        fs.mkdirSync(`${this.ansibleWorkspacePath}/templates/${this.appName}/`, { recursive: true });
        fs.writeFileSync(`${this.ansibleWorkspacePath}/templates/${this.appName}/application-prod.yml.j2`, yaml.safeDump(prodConfig));

        const deployEnvs = this.promptAnswers.hosts.replace(/\s/g, '').split(',');
        let i;
        for (i = 0; i < deployEnvs.length; i++) {
            this.deployEnv = deployEnvs[i];
            this.template('hosts/env/inventory', `${this.ansibleWorkspacePath}/hosts/${this.deployEnv}/inventory`);
            this.template(
                'hosts/env/group_vars/app/vars.yml',
                `${this.ansibleWorkspacePath}/hosts/${this.deployEnv}/group_vars/${this.appName}/vars.yml`
            );
            this.template(
                'hosts/env/group_vars/app/vault.yml',
                `${this.ansibleWorkspacePath}/hosts/${this.deployEnv}/group_vars/${this.appName}/vault.yml`
            );
        }
    }

    install() {
        const logMsg = 'To install your dependencies manually, run: ansible-galaxy -r .roles/requirements.yml install';
        this.log(logMsg);
    }

    end() {
        this.log('End of ansible generator');
    }
};
