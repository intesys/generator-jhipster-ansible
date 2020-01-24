# generator-jhipster-ansible

[![NPM version][npm-image]][npm-url] [![Build Status][github-actions-image]][github-actions-url] [![Dependency Status][daviddm-image]][daviddm-url]

> A Jhipster module to generate an [Ansible](https://www.ansible.com/) deployment workspace.

# Introduction

This is a [JHipster](https://www.jhipster.tech/) module, that is meant to be used in a JHipster application.

This module will generate all the files to deploy you Jhipster jar in your multi stage environment via Ansible.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

# Installation

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-ansible
```

To update this module:

```bash
npm update -g generator-jhipster-ansible
```

## With Yarn

To install this module:

```bash
yarn global add generator-jhipster-ansible
```

To update this module:

```bash
yarn global upgrade generator-jhipster-ansible
```

# Usage

In your jhipster workspace:
```bash
yo jhipster-ansible
? *Ansible Directory*: Enter the ansible workspace directory ./ansible
? *Maven*: what is the URL of distributionManagement for snapshots ? http://artifactory:8081/artifactory/libs-snapshot
? *Maven*: what is the URL of distributionManagement for releases ? http://artifactory:8081/artifactory/libs-release
? *Enviroments*: which enviroments do you want to deploy to (comma separated) ? test,staging,prod
? *SSH User*: 'what is the ssh user you will use to deploy (not mandatory)) ? myuser
```

# Dependencies

- https://github.com/orachide/ansible-role-springboot

# License

Apache-2.0 © [Intesys SRL](https://www.intesys.it)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-ansible.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-ansible
[github-actions-image]: https://github.com/intesys/generator-jhipster-ansible/workflows/Build/badge.svg
[github-actions-url]: https://github.com/intesys/generator-jhipster-ansible/actions
[daviddm-image]: https://david-dm.org/intesys/generator-jhipster-ansible.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/intesys/generator-jhipster-ansible
